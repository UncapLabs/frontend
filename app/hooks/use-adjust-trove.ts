import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { contractCall } from "~/lib/contracts/calls";
import { useTransaction } from "./use-transaction";
import type { Collateral, CollateralId } from "~/lib/collateral";
import { requiresWrapping } from "~/lib/collateral";
import Big from "big.js";
import { bigToBigint } from "~/lib/decimal";

interface UseAdjustTroveParams {
  troveId?: bigint;
  currentCollateral?: Big;
  currentDebt?: Big;
  currentInterestRate?: bigint;
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
      if (requiresWrapping(collateral)) {
        // For wrapped tokens: wrap underlying token before adding
        const underlyingAddress = collateral.underlyingToken!.address;
        const underlyingDecimals = collateral.underlyingToken!.decimals;
        const decimalsDiff = 18n - BigInt(underlyingDecimals);
        const underlyingAmount = collateralChange / (10n ** decimalsDiff);

        // 1. Approve underlying token to wrapper
        calls.push(
          contractCall.token.approve(
            underlyingAddress,
            collateralTokenAddress,
            underlyingAmount
          )
        );

        // 2. Wrap underlying token
        calls.push(
          contractCall.collateralWrapper.wrap(
            collateralTokenAddress,
            underlyingAmount
          )
        );

        // 3. Approve wrapped token to BorrowerOperations
        calls.push(
          contractCall.token.approve(
            collateralTokenAddress,
            addresses.borrowerOperations,
            collateralChange
          )
        );
      } else {
        calls.push(
          contractCall.token.approve(
            collateralTokenAddress,
            addresses.borrowerOperations,
            collateralChange
          )
        );
      }
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
    if (!isCollIncrease && collateralChange !== 0n && requiresWrapping(collateral) && collateralTokenAddress) {
      calls.push(
        contractCall.collateralWrapper.unwrap(
          collateralTokenAddress,
          collateralChange
        )
      );
    }

    return calls;
  }

  // If both collateral and debt are changing, use adjust_trove for efficiency
  if (collateralChange !== 0n && debtChange !== 0n) {
    // Need approvals for additions
    if (isCollIncrease && collateralTokenAddress) {
      if (requiresWrapping(collateral)) {
        // For wrapped tokens: wrap underlying token before adding
        const underlyingAddress = collateral.underlyingToken!.address;
        const underlyingDecimals = collateral.underlyingToken!.decimals;
        const decimalsDiff = 18n - BigInt(underlyingDecimals);
        const underlyingAmount = collateralChange / (10n ** decimalsDiff);

        // 1. Approve underlying token to wrapper
        calls.push(
          contractCall.token.approve(
            underlyingAddress,
            collateralTokenAddress,
            underlyingAmount
          )
        );

        // 2. Wrap underlying token
        calls.push(
          contractCall.collateralWrapper.wrap(
            collateralTokenAddress,
            underlyingAmount
          )
        );

        // 3. Approve wrapped token to BorrowerOperations
        calls.push(
          contractCall.token.approve(
            collateralTokenAddress,
            addresses.borrowerOperations,
            collateralChange
          )
        );
      } else {
        calls.push(
          contractCall.token.approve(
            collateralTokenAddress,
            addresses.borrowerOperations,
            collateralChange
          )
        );
      }
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
    if (!isCollIncrease && requiresWrapping(collateral) && collateralTokenAddress) {
      calls.push(
        contractCall.collateralWrapper.unwrap(
          collateralTokenAddress,
          collateralChange
        )
      );
    }

    return calls;
  }

  // Single operation - use specific functions for better gas efficiency
  if (collateralChange !== 0n) {
    if (isCollIncrease) {
      // Adding collateral
      if (requiresWrapping(collateral)) {
        // For wrapped tokens: wrap underlying token before adding
        const underlyingAddress = collateral.underlyingToken!.address;
        const underlyingDecimals = collateral.underlyingToken!.decimals;

        // Calculate underlying amount from wrapped amount
        // Since we assume 1:1 ratio, just adjust decimals
        const decimalsDiff = 18n - BigInt(underlyingDecimals);
        const underlyingAmount = collateralChange / (10n ** decimalsDiff);

        // 1. Approve underlying token to wrapper
        calls.push(
          contractCall.token.approve(
            underlyingAddress,
            collateralTokenAddress!, // Wrapper address
            underlyingAmount
          )
        );

        // 2. Wrap underlying token
        calls.push(
          contractCall.collateralWrapper.wrap(
            collateralTokenAddress!, // Wrapper address
            underlyingAmount
          )
        );

        // 3. Approve wrapped token to BorrowerOperations
        calls.push(
          contractCall.token.approve(
            collateralTokenAddress!, // Wrapped token address
            addresses.borrowerOperations,
            collateralChange // Now in 18 decimals
          )
        );
      } else if (collateralTokenAddress) {
        // Standard collateral - just approve
        calls.push(
          contractCall.token.approve(
            collateralTokenAddress,
            addresses.borrowerOperations,
            collateralChange
          )
        );
      }

      // 4. Add collateral
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
      if (requiresWrapping(collateral) && collateralTokenAddress) {
        calls.push(
          contractCall.collateralWrapper.unwrap(
            collateralTokenAddress, // Wrapper address
            collateralChange // Unwrap the full 18-decimal amount
          )
        );
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
    if (!currentCollateral || !currentDebt || currentInterestRate === undefined) {
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

    return {
      collateralChange: bigToBigint(collateralDiff.abs(), collateralDecimals),
      debtChange: bigToBigint(debtDiff.abs(), 18),
      isCollIncrease: collateralDiff.gt(0),
      isDebtIncrease: debtDiff.gt(0),
      hasCollateralChange: collateralDiff.abs().gt(0.000001), // Minimum change threshold
      hasDebtChange: debtDiff.abs().gt(0.01), // Minimum change threshold
      hasInterestRateChange: currentInterestRate !== targetInterestRate,
      newInterestRate: targetInterestRate,
    };
  }, [
    currentCollateral,
    currentDebt,
    currentInterestRate,
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
      collateral,
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
  }, [address, troveId, changes, maxUpfrontFee, collateral]);

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
