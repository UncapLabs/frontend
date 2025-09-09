import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { contractCall } from "~/lib/contracts/calls";
import { useTransaction } from "./use-transaction";
import { toBigInt } from "~/lib/utils";
import {
  getCollateralAddresses,
  type CollateralType,
} from "~/lib/contracts/constants";

interface UseAdjustTroveParams {
  troveId?: bigint;
  currentCollateral?: number;
  currentDebt?: number;
  currentInterestRate?: bigint;
  newCollateral?: number;
  newDebt?: number;
  newInterestRate?: bigint;
  maxUpfrontFee?: bigint;
  collateralToken?: { address: string; collateralType?: CollateralType };
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
  collateralTokenAddress?: string;
  collateralType: CollateralType;
  isZombie?: boolean;
}) {
  const {
    troveId,
    collateralChange,
    debtChange,
    isCollIncrease,
    isDebtIncrease,
    maxUpfrontFee,
    collateralTokenAddress,
    collateralType,
    isZombie = false,
  } = params;
  const calls = [];

  // Get contract addresses for this collateral type
  const addresses = getCollateralAddresses(collateralType);

  // Special handling for zombie troves - must use adjust_zombie_trove
  if (isZombie) {
    // Need approvals for additions
    if (isCollIncrease && collateralTokenAddress) {
      calls.push(
        contractCall.token.approve(
          collateralTokenAddress,
          addresses.borrowerOperations,
          collateralChange
        )
      );
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
    return calls;
  }

  // If both collateral and debt are changing, use adjust_trove for efficiency
  if (collateralChange !== 0n && debtChange !== 0n) {
    // Need approvals for additions
    if (isCollIncrease && collateralTokenAddress) {
      calls.push(
        contractCall.token.approve(
          collateralTokenAddress,
          addresses.borrowerOperations,
          collateralChange
        )
      );
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
    return calls;
  }

  // Single operation - use specific functions for better gas efficiency
  if (collateralChange !== 0n) {
    if (isCollIncrease) {
      // Adding collateral
      if (collateralTokenAddress) {
        calls.push(
          contractCall.token.approve(
            collateralTokenAddress,
            addresses.borrowerOperations,
            collateralChange
          )
        );
      }
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
  newCollateral,
  newDebt,
  newInterestRate,
  maxUpfrontFee = 2n ** 256n - 1n,
  collateralToken,
  isZombie = false,
}: UseAdjustTroveParams) {
  const { address } = useAccount();

  // Calculate the changes
  const changes = useMemo(() => {
    if (
      !currentCollateral ||
      !currentDebt ||
      currentInterestRate === undefined ||
      newCollateral === undefined ||
      newDebt === undefined ||
      newInterestRate === undefined
    ) {
      return null;
    }

    const collateralDiff = newCollateral - currentCollateral;
    const debtDiff = newDebt - currentDebt;

    return {
      collateralChange: toBigInt(Math.abs(collateralDiff)),
      debtChange: toBigInt(Math.abs(debtDiff)),
      isCollIncrease: collateralDiff > 0,
      isDebtIncrease: debtDiff > 0,
      hasCollateralChange: Math.abs(collateralDiff) > 0.000001, // Minimum change threshold
      hasDebtChange: Math.abs(debtDiff) > 0.01, // Minimum change threshold
      hasInterestRateChange: currentInterestRate !== newInterestRate,
      newInterestRate: newInterestRate,
    };
  }, [
    currentCollateral,
    currentDebt,
    currentInterestRate,
    newCollateral,
    newDebt,
    newInterestRate,
  ]);

  // Prepare the calls using smart routing
  const calls = useMemo(() => {
    if (!address || !troveId || !changes || !collateralToken) {
      return undefined;
    }

    // Determine collateral type
    const collateralType: CollateralType =
      collateralToken.collateralType ||
      (collateralToken.address === getCollateralAddresses("UBTC").collateral
        ? "UBTC"
        : "GBTC");

    // No changes
    if (
      !changes.hasCollateralChange &&
      !changes.hasDebtChange &&
      !changes.hasInterestRateChange
    ) {
      return undefined;
    }

    // If only interest rate is changing, use adjust_trove_interest_rate
    if (
      !changes.hasCollateralChange &&
      !changes.hasDebtChange &&
      changes.hasInterestRateChange
    ) {
      return [
        contractCall.borrowerOperations.adjustTroveInterestRate({
          troveId,
          annualInterestRate: changes.newInterestRate,
          upperHint: 0n,
          lowerHint: 0n,
          maxUpfrontFee,
          collateralType,
        }),
      ];
    }

    const baseCalls = getAdjustmentCalls({
      troveId,
      collateralChange: changes.hasCollateralChange
        ? changes.collateralChange
        : 0n,
      debtChange: changes.hasDebtChange ? changes.debtChange : 0n,
      isCollIncrease: changes.isCollIncrease,
      isDebtIncrease: changes.isDebtIncrease,
      maxUpfrontFee,
      collateralTokenAddress: collateralToken.address,
      collateralType,
      isZombie,
    });

    // If interest rate is also changing, add the interest rate adjustment call
    if (changes.hasInterestRateChange) {
      baseCalls.push(
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

    return baseCalls;
  }, [address, troveId, changes, maxUpfrontFee, collateralToken]);

  // Use the generic transaction hook
  const transaction = useTransaction(calls);

  return {
    ...transaction,
    isReady:
      !!calls &&
      !!changes &&
      (changes.hasCollateralChange ||
        changes.hasDebtChange ||
        changes.hasInterestRateChange),
    changes,
  };
}
