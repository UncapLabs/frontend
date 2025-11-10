import { useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { useAdjustTrove } from "./use-adjust-trove";
import { useTransactionState } from "./use-transaction-state";
import type { Collateral } from "~/lib/collateral";
import { useTransactionStore } from "~/providers/transaction-provider";
import { createTransactionDescription } from "~/lib/transaction-descriptions";
import { MIN_DEBT } from "~/lib/contracts/constants";
import { DEFAULT_COLLATERAL } from "~/lib/collateral";
import {
  getAnnualInterestRateAsBigInt,
  extractTroveId,
  getInterestRatePercentage,
} from "~/lib/utils/position-helpers";
import { getAnnualInterestRate } from "~/lib/utils/calc";
import { bigintToBig } from "~/lib/decimal";
import Big from "big.js";
import type { Position } from "workers/services/trove-service";

const DEFAULT_INTEREST_RATE = new Big(2.5);

export interface UpdateFormData {
  // Previous values (snapshot at transaction time)
  previousCollateral?: Big;
  previousDebt?: Big;
  previousInterestRate?: Big;
  previousLiquidationPrice?: Big;
  // Target values (snapshot at transaction time)
  collateralAmount?: Big;
  borrowAmount?: Big;
  interestRate: Big;
  liquidationPrice?: Big;
  selectedCollateralToken: string;
  targetBatchManager?: string;
}

interface UseUpdatePositionParams {
  position: Position | null;
  collateralAmount?: Big;
  borrowAmount?: Big;
  interestRate?: Big;
  managedInterestRate?: Big;
  collateralToken?: Collateral;
  onSuccess?: () => void;
  targetBatchManager?: string | null;
  // Liquidation prices for snapshot
  liquidationPrice?: Big;
  previousLiquidationPrice?: Big;
}

export function useUpdatePosition({
  position,
  collateralAmount,
  borrowAmount,
  interestRate,
  managedInterestRate,
  collateralToken,
  onSuccess,
  targetBatchManager,
  liquidationPrice,
  previousLiquidationPrice,
}: UseUpdatePositionParams) {
  const { address } = useAccount();
  const transactionStore = useTransactionStore();
  const normalizedTargetBatchManager =
    targetBatchManager === null ? undefined : targetBatchManager;

  // Transaction state management
  const transactionState = useTransactionState<UpdateFormData>({
    initialFormData: {
      collateralAmount: position?.collateralAmount,
      borrowAmount: position?.borrowedAmount,
      interestRate:
        managedInterestRate ??
        interestRate ??
        (position ? getInterestRatePercentage(position) : DEFAULT_INTEREST_RATE),
      selectedCollateralToken: collateralToken?.symbol || DEFAULT_COLLATERAL.symbol,
      targetBatchManager: normalizedTargetBatchManager,
    },
  });

  const isZombie = Boolean(
    position &&
      position.status === "redeemed" &&
      position.borrowedAmount.gt(0) &&
      position.borrowedAmount.lt(MIN_DEBT)
  );

  const {
    send: adjustTroveSend,
    isPending: adjustTroveIsPending,
    isSending: adjustTroveIsSending,
    isError: adjustTroveIsError,
    error: adjustTroveError,
    transactionHash: adjustTroveTransactionHash,
    isReady,
    isSuccess: adjustTroveIsSuccess,
    changes,
  } = useAdjustTrove({
    troveId: position ? extractTroveId(position.id) : undefined,
    currentCollateral: position?.collateralAmount,
    currentDebt: position?.borrowedAmount,
    currentInterestRate: position
      ? getAnnualInterestRateAsBigInt(position)
      : undefined,
    newCollateral: collateralAmount,
    newDebt: borrowAmount,
    newInterestRate: interestRate
      ? getAnnualInterestRate(interestRate)
      : undefined,
    collateral: collateralToken || DEFAULT_COLLATERAL,
    isZombie,
    currentBatchManager: position?.batchManager ?? null,
    targetBatchManager,
  });

  // Create a wrapped send function that manages state transitions
  const send = useCallback(async () => {
    const hash = await adjustTroveSend();

    if (hash) {
      const fallbackPositionRate = position
        ? getInterestRatePercentage(position)
        : undefined;
      const finalInterestRate =
        managedInterestRate ??
        interestRate ??
        fallbackPositionRate ??
        DEFAULT_INTEREST_RATE;

      // Transaction was sent successfully, move to pending
      // Capture snapshot of both previous and target values
      transactionState.updateFormData({
        previousCollateral: position?.collateralAmount,
        previousDebt: position?.borrowedAmount,
        previousInterestRate: position ? getInterestRatePercentage(position) : undefined,
        previousLiquidationPrice,
        collateralAmount: collateralAmount || position?.collateralAmount,
        borrowAmount: borrowAmount || position?.borrowedAmount,
        interestRate: finalInterestRate,
        liquidationPrice,
        selectedCollateralToken: collateralToken?.symbol || DEFAULT_COLLATERAL.symbol,
        targetBatchManager: normalizedTargetBatchManager,
      });
      transactionState.setPending(hash);

      // Add to transaction store
      if (address && position) {
        const description = createTransactionDescription("adjust", {
          hasCollateralChange: changes?.hasCollateralChange || false,
          isCollIncrease: changes?.isCollIncrease || false,
          collateralChange: changes?.collateralChange
            ? bigintToBig(changes.collateralChange, collateralToken?.decimals || 18)
            : new Big(0),
          hasDebtChange: changes?.hasDebtChange || false,
          isDebtIncrease: changes?.isDebtIncrease || false,
          debtChange: changes?.debtChange
            ? bigintToBig(changes.debtChange, 18)
            : new Big(0),
          hasInterestRateChange: changes?.hasInterestRateChange || false,
          newInterestRate: finalInterestRate,
          collateralToken: collateralToken?.symbol || DEFAULT_COLLATERAL.symbol,
          hasBatchManagerChange: changes?.hasBatchManagerChange || false,
          targetBatchManager: normalizedTargetBatchManager,
        });

        const transactionData = {
          hash,
          type: "adjust" as const,
          description,
          details: {
            troveId: position.id,
            previousCollateral: position.collateralAmount,
            previousDebt: position.borrowedAmount,
            newCollateral: collateralAmount || undefined,
            newDebt: borrowAmount || undefined,
            previousInterestRate: getInterestRatePercentage(position),
            newInterestRate: finalInterestRate,
            collateralToken: collateralToken?.symbol || DEFAULT_COLLATERAL.symbol,
            collateralType: collateralToken?.id || DEFAULT_COLLATERAL.id,
            previousBatchManager: position.batchManager || undefined,
            targetBatchManager: normalizedTargetBatchManager,
          },
        };

        transactionStore.addTransaction(address, transactionData);
      }
    }
  }, [
    adjustTroveSend,
    transactionState,
    transactionStore,
    collateralAmount,
    borrowAmount,
    interestRate,
    managedInterestRate,
    collateralToken,
    address,
    position,
    changes,
    targetBatchManager,
    normalizedTargetBatchManager,
    liquidationPrice,
    previousLiquidationPrice,
  ]);

  // Check if we need to update state based on transaction status
  if (transactionState.currentState === "pending") {
    if (adjustTroveIsSuccess) {
      transactionState.setSuccess();
      if (onSuccess) {
        onSuccess();
      }
    } else if (adjustTroveIsError && adjustTroveError) {
      transactionState.setError(adjustTroveError);
    }
  }

  return {
    send,
    isPending: adjustTroveIsPending,
    isSending: adjustTroveIsSending,
    error: adjustTroveError,
    transactionHash: adjustTroveTransactionHash,
    isReady,
    currentState: transactionState.currentState,
    formData: transactionState.formData,
    reset: transactionState.reset,
    changes,
  };
}
