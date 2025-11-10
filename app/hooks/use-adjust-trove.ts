import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { contractCall } from "~/lib/contracts/calls";
import { useTransaction } from "./use-transaction";
import type { Collateral, CollateralId } from "~/lib/collateral";
import {
  generateDepositCallsFromBigint,
  generateUnwrapCallFromBigint,
  requiresWrapping,
} from "~/lib/collateral/wrapping";
import Big from "big.js";
import { bigToBigint } from "~/lib/decimal";
import { areAddressesEqual } from "~/lib/utils/address";

interface UseAdjustTroveParams {
  troveId?: bigint;
  currentCollateral?: Big;
  currentDebt?: Big;
  currentInterestRate?: bigint;
  currentBatchManager?: string | null;
  targetBatchManager?: string | null;
  newCollateral?: Big;
  newDebt?: Big;
  newInterestRate?: bigint;
  maxUpfrontFee?: bigint;
  collateral?: Collateral;
  isZombie?: boolean; // Add flag to identify zombie troves
}

// Determine which contract function to call based on changes
function getAdjustmentCalls(params: {
  troveId: bigint;
  collateralChange: bigint;
  debtChange: bigint;
  isCollIncrease: boolean;
  isDebtIncrease: boolean;
  maxUpfrontFee: bigint;
  collateral: Collateral;
  isZombie?: boolean;
}) {
  const {
    troveId,
    collateralChange,
    debtChange,
    isCollIncrease,
    isDebtIncrease,
    maxUpfrontFee,
    collateral,
    isZombie = false,
  } = params;
  const calls = [];

  // Get addresses and collateralType from collateral object
  const addresses = collateral.addresses;
  const collateralType = collateral.id as CollateralId;
  const collateralTokenAddress = collateral.address;

  // Special handling for zombie troves - must use adjust_zombie_trove
  if (isZombie) {
    // Need approvals for additions
    if (isCollIncrease && collateralTokenAddress) {
      const depositCalls = generateDepositCallsFromBigint(
        collateral,
        collateralChange,
        addresses.borrowerOperations
      );
      calls.push(...depositCalls);
    }
    if (!isDebtIncrease && debtChange !== 0n) {
      // Repaying debt - need to approve USDU spending
      calls.push(
        contractCall.usdu.approve(addresses.borrowerOperations, debtChange)
      );
    }

    // Use adjust_zombie_trove for any changes to a zombie trove
    calls.push(
      contractCall.borrowerOperations.adjustZombieTrove({
        troveId,
        collChange: collateralChange,
        isCollIncrease,
        debtChange,
        isDebtIncrease,
        upperHint: 0n,
        lowerHint: 0n,
        maxUpfrontFee,
        collateralType,
      })
    );

    // For wrapped tokens: unwrap after withdrawal
    if (
      !isCollIncrease &&
      collateralChange !== 0n &&
      requiresWrapping(collateral)
    ) {
      calls.push(generateUnwrapCallFromBigint(collateral, collateralChange));
    }

    return calls;
  }

  // If both collateral and debt are changing, use adjust_trove for efficiency
  if (collateralChange !== 0n && debtChange !== 0n) {
    // Need approvals for additions
    if (isCollIncrease && collateralTokenAddress) {
      const depositCalls = generateDepositCallsFromBigint(
        collateral,
        collateralChange,
        addresses.borrowerOperations
      );
      calls.push(...depositCalls);
    }
    if (!isDebtIncrease) {
      // Repaying debt - need to approve USDU spending
      calls.push(
        contractCall.usdu.approve(addresses.borrowerOperations, debtChange)
      );
    }

    calls.push(
      contractCall.borrowerOperations.adjustTrove({
        troveId,
        collChange: collateralChange,
        isCollIncrease,
        debtChange,
        isDebtIncrease,
        maxUpfrontFee,
        collateralType,
      })
    );

    // For wrapped tokens: unwrap after withdrawal
    if (!isCollIncrease && requiresWrapping(collateral)) {
      calls.push(generateUnwrapCallFromBigint(collateral, collateralChange));
    }

    return calls;
  }

  // Single operation - use specific functions for better gas efficiency
  if (collateralChange !== 0n) {
    if (isCollIncrease) {
      // Adding collateral - generate deposit calls (handles wrapping)
      const depositCalls = generateDepositCallsFromBigint(
        collateral,
        collateralChange,
        addresses.borrowerOperations
      );
      calls.push(...depositCalls);

      // Add collateral to trove
      calls.push(
        contractCall.borrowerOperations.addColl(
          troveId,
          collateralChange,
          collateralType
        )
      );
    } else {
      // Withdrawing collateral
      calls.push(
        contractCall.borrowerOperations.withdrawColl(
          troveId,
          collateralChange,
          collateralType
        )
      );

      // For wrapped tokens: unwrap after withdrawal
      if (requiresWrapping(collateral)) {
        calls.push(generateUnwrapCallFromBigint(collateral, collateralChange));
      }
    }
  } else if (debtChange !== 0n) {
    if (isDebtIncrease) {
      // Borrowing more
      calls.push(
        contractCall.borrowerOperations.withdrawUsdu(
          troveId,
          debtChange,
          maxUpfrontFee,
          collateralType
        )
      );
    } else {
      // Repaying debt
      calls.push(
        contractCall.usdu.approve(addresses.borrowerOperations, debtChange),
        contractCall.borrowerOperations.repayUsdu(
          troveId,
          debtChange,
          collateralType
        )
      );
    }
  }

  return calls;
}

export function useAdjustTrove({
  troveId,
  currentCollateral,
  currentDebt,
  currentInterestRate,
  currentBatchManager,
  targetBatchManager,
  newCollateral,
  newDebt,
  newInterestRate,
  maxUpfrontFee = 2n ** 256n - 1n,
  collateral,
  isZombie = false,
}: UseAdjustTroveParams) {
  const { address } = useAccount();

  const changes = useMemo(() => {
    // Need at least current values to calculate changes
    if (
      !currentCollateral ||
      !currentDebt ||
      currentInterestRate === undefined
    ) {
      return null;
    }

    // Use current values as defaults if new values not provided
    const targetCollateral = newCollateral ?? currentCollateral;
    const targetDebt = newDebt ?? currentDebt;
    const targetInterestRate = newInterestRate ?? currentInterestRate;

    const collateralDiff = targetCollateral.minus(currentCollateral);
    const debtDiff = targetDebt.minus(currentDebt);

    // Use collateral decimals if available, otherwise default to 18
    const collateralDecimals = collateral?.decimals || 18;

    const currentManager = currentBatchManager ?? "0x0";
    const targetManager =
      targetBatchManager === undefined
        ? currentManager
        : targetBatchManager ?? "0x0";
    const hasBatchManagerChange =
      targetBatchManager !== undefined &&
      !areAddressesEqual(targetManager, currentManager);
    const leavingBatchManager =
      targetBatchManager === null && !areAddressesEqual(currentManager, "0x0");

    return {
      collateralChange: bigToBigint(collateralDiff.abs(), collateralDecimals),
      debtChange: bigToBigint(debtDiff.abs(), 18),
      isCollIncrease: collateralDiff.gt(0),
      isDebtIncrease: debtDiff.gt(0),
      hasCollateralChange: collateralDiff.abs().gt(0.000001), // Minimum change threshold
      hasDebtChange: debtDiff.abs().gt(0.01), // Minimum change threshold
      hasInterestRateChange: currentInterestRate !== targetInterestRate,
      newInterestRate: targetInterestRate,
      hasBatchManagerChange,
      targetBatchManager,
      leavingBatchManager,
    };
  }, [
    currentCollateral,
    currentDebt,
    currentInterestRate,
    currentBatchManager,
    targetBatchManager,
    newCollateral,
    newDebt,
    newInterestRate,
    collateral,
  ]);

  // Prepare the calls using smart routing
  const calls = useMemo(() => {
    if (!address || !troveId || !changes || !collateral) {
      return undefined;
    }

    // Use the collateral ID directly - it's already properly typed
    const collateralType = collateral.id as CollateralId;

    if (
      !changes.hasCollateralChange &&
      !changes.hasDebtChange &&
      !changes.hasInterestRateChange &&
      !changes.hasBatchManagerChange
    ) {
      return undefined;
    }

    const callsList = [];

    if (changes.hasBatchManagerChange) {
      if (changes.leavingBatchManager) {
        callsList.push(
          contractCall.borrowerOperations.removeFromBatch({
            troveId,
            newAnnualInterestRate: changes.newInterestRate,
            upperHint: 0n,
            lowerHint: 0n,
            maxUpfrontFee,
            collateralType,
          })
        );
      } else if (changes.targetBatchManager) {
        callsList.push(
          contractCall.borrowerOperations.setInterestBatchManager({
            troveId,
            newBatchManager: changes.targetBatchManager,
            upperHint: 0n,
            lowerHint: 0n,
            maxUpfrontFee,
            collateralType,
          })
        );
      }
    }

    if (changes.hasCollateralChange || changes.hasDebtChange) {
      const baseCalls = getAdjustmentCalls({
        troveId,
        collateralChange: changes.hasCollateralChange
          ? changes.collateralChange
          : 0n,
        debtChange: changes.hasDebtChange ? changes.debtChange : 0n,
        isCollIncrease: changes.isCollIncrease,
        isDebtIncrease: changes.isDebtIncrease,
        maxUpfrontFee,
        collateral,
        isZombie,
      });
      callsList.push(...baseCalls);
    }

    // If interest rate is also changing, add the interest rate adjustment call
    if (changes.hasInterestRateChange && !changes.leavingBatchManager) {
      callsList.push(
        contractCall.borrowerOperations.adjustTroveInterestRate({
          troveId,
          annualInterestRate: changes.newInterestRate,
          upperHint: 0n,
          lowerHint: 0n,
          maxUpfrontFee,
          collateralType,
        })
      );
    }

    return callsList.length > 0 ? callsList : undefined;
  }, [address, troveId, changes, maxUpfrontFee, collateral, isZombie]);

  // Use the generic transaction hook
  const transaction = useTransaction(calls);

  return {
    ...transaction,
    isReady:
      !!calls &&
      !!changes &&
      (changes.hasCollateralChange ||
        changes.hasDebtChange ||
        changes.hasInterestRateChange ||
        changes.hasBatchManagerChange),
    changes,
  };
}
