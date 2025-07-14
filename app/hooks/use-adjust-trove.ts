import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { contractCall } from "~/lib/contracts/calls";
import { useTransaction } from "./use-transaction";
import { BORROWER_OPERATIONS_ADDRESS } from "~/lib/contracts/constants";

interface UseAdjustTroveParams {
  troveId?: bigint;
  currentCollateral?: number;
  currentDebt?: number;
  newCollateral?: number;
  newDebt?: number;
  maxUpfrontFee?: bigint;
}

// Determine which contract function to call based on changes
function getAdjustmentCalls(params: {
  troveId: bigint;
  collateralChange: bigint;
  debtChange: bigint;
  isCollIncrease: boolean;
  isDebtIncrease: boolean;
  maxUpfrontFee: bigint;
}) {
  const {
    troveId,
    collateralChange,
    debtChange,
    isCollIncrease,
    isDebtIncrease,
    maxUpfrontFee,
  } = params;
  const calls = [];

  // If both collateral and debt are changing, use adjust_trove for efficiency
  if (collateralChange !== 0n && debtChange !== 0n) {
    // Need approvals for additions
    if (isCollIncrease) {
      calls.push(
        contractCall.tbtc.approve(BORROWER_OPERATIONS_ADDRESS, collateralChange)
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
      calls.push(
        contractCall.tbtc.approve(
          BORROWER_OPERATIONS_ADDRESS,
          collateralChange
        ),
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
  newCollateral,
  newDebt,
  maxUpfrontFee = 2n ** 256n - 1n,
}: UseAdjustTroveParams) {
  const { address } = useAccount();

  // Calculate the changes
  const changes = useMemo(() => {
    if (
      !currentCollateral ||
      !currentDebt ||
      newCollateral === undefined ||
      newDebt === undefined
    ) {
      return null;
    }

    const collateralDiff = newCollateral - currentCollateral;
    const debtDiff = newDebt - currentDebt;

    return {
      collateralChange: BigInt(Math.floor(Math.abs(collateralDiff) * 1e18)),
      debtChange: BigInt(Math.floor(Math.abs(debtDiff) * 1e18)),
      isCollIncrease: collateralDiff > 0,
      isDebtIncrease: debtDiff > 0,
      hasCollateralChange: Math.abs(collateralDiff) > 0.000001, // Minimum change threshold
      hasDebtChange: Math.abs(debtDiff) > 0.01, // Minimum change threshold
    };
  }, [currentCollateral, currentDebt, newCollateral, newDebt]);

  // Prepare the calls using smart routing
  const calls = useMemo(() => {
    if (!address || !troveId || !changes) {
      return undefined;
    }

    // No changes
    if (!changes.hasCollateralChange && !changes.hasDebtChange) {
      return undefined;
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
    });
  }, [address, troveId, changes, maxUpfrontFee]);

  // Use the generic transaction hook
  const transaction = useTransaction(calls);

  return {
    ...transaction,
    isReady:
      !!calls &&
      !!changes &&
      (changes.hasCollateralChange || changes.hasDebtChange),
    changes,
  };
}
