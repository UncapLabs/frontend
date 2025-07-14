import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { Contract } from "starknet";
import { contractCall } from "~/lib/contracts/calls";
import * as contractDefs from "~/lib/contracts/definitions";
import { useTransaction } from "./use-transaction";
import { toBigInt } from "~/lib/utils";
import { BORROWER_OPERATIONS_ADDRESS } from "~/lib/contracts/constants";

interface UseAdjustTroveParams {
  troveId?: bigint;
  currentCollateral?: number;
  currentDebt?: number;
  currentInterestRate?: bigint;
  newCollateral?: number;
  newDebt?: number;
  newInterestRate?: bigint;
  maxUpfrontFee?: bigint;
  collateralToken?: { address: string };
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
}) {
  const {
    troveId,
    collateralChange,
    debtChange,
    isCollIncrease,
    isDebtIncrease,
    maxUpfrontFee,
    collateralTokenAddress,
  } = params;
  const calls = [];

  // If both collateral and debt are changing, use adjust_trove for efficiency
  if (collateralChange !== 0n && debtChange !== 0n) {
    // Need approvals for additions
    if (isCollIncrease && collateralTokenAddress) {
      calls.push(
        contractCall.token.approve(collateralTokenAddress, BORROWER_OPERATIONS_ADDRESS, collateralChange)
      );
    }
    if (!isDebtIncrease) {
      // Repaying debt - need to approve BitUSD spending
      calls.push(
        contractCall.bitUsd.approve(BORROWER_OPERATIONS_ADDRESS, debtChange)
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
            BORROWER_OPERATIONS_ADDRESS,
            collateralChange
          )
        );
      }
      calls.push(
        contractCall.borrowerOperations.addColl(troveId, collateralChange)
      );
    } else {
      // Withdrawing collateral
      calls.push(
        contractCall.borrowerOperations.withdrawColl(troveId, collateralChange)
      );
    }
  } else if (debtChange !== 0n) {
    if (isDebtIncrease) {
      // Borrowing more
      calls.push(
        contractCall.borrowerOperations.withdrawBitUsd(
          troveId,
          debtChange,
          maxUpfrontFee
        )
      );
    } else {
      // Repaying debt
      calls.push(
        contractCall.bitUsd.approve(BORROWER_OPERATIONS_ADDRESS, debtChange),
        contractCall.borrowerOperations.repayBitUsd(troveId, debtChange)
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
  }, [currentCollateral, currentDebt, currentInterestRate, newCollateral, newDebt, newInterestRate]);

  // Prepare the calls using smart routing
  const calls = useMemo(() => {
    if (!address || !troveId || !changes) {
      return undefined;
    }

    // No changes
    if (!changes.hasCollateralChange && !changes.hasDebtChange && !changes.hasInterestRateChange) {
      return undefined;
    }
    
    // If only interest rate is changing, use adjust_trove_interest_rate
    if (!changes.hasCollateralChange && !changes.hasDebtChange && changes.hasInterestRateChange) {
      const contract = new Contract(
        contractDefs.BorrowerOperations.abi,
        contractDefs.BorrowerOperations.address
      );
      return [
        contract.populate("adjust_trove_interest_rate", [
          troveId,
          changes.newInterestRate,
          0n, // upperHint
          0n, // lowerHint
          maxUpfrontFee,
        ]),
      ];
    }

    return getAdjustmentCalls({
      troveId,
      collateralChange: changes.hasCollateralChange
        ? changes.collateralChange
        : 0n,
      debtChange: changes.hasDebtChange ? changes.debtChange : 0n,
      isCollIncrease: changes.isCollIncrease,
      isDebtIncrease: changes.isDebtIncrease,
      maxUpfrontFee,
      collateralTokenAddress: collateralToken?.address,
    });
  }, [address, troveId, changes, maxUpfrontFee, collateralToken]);

  // Use the generic transaction hook
  const transaction = useTransaction(calls);

  return {
    ...transaction,
    isReady:
      !!calls &&
      !!changes &&
      (changes.hasCollateralChange || changes.hasDebtChange || changes.hasInterestRateChange),
    changes,
  };
}
