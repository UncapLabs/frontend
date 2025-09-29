import { useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { useAdjustTrove } from "./use-adjust-trove";
import { useTransactionState } from "./use-transaction-state";
import type { Token } from "~/components/token-input";
import { useTransactionStore } from "~/providers/transaction-provider";
import { createTransactionDescription } from "~/lib/transaction-descriptions";
import { UBTC_TOKEN, MIN_DEBT } from "~/lib/contracts/constants";
import {
  getAnnualInterestRateAsBigInt,
  extractTroveId,
  getInterestRatePercentage,
} from "~/lib/utils/position-helpers";
import { getAnnualInterestRate } from "~/lib/utils/calc";
import { bigintToDecimal } from "~/lib/decimal";
import Big from "big.js";

// Update form data structure to use Big for precision
export interface UpdateFormData {
  collateralAmount?: Big;
  borrowAmount?: Big;
  interestRate: number;
  selectedCollateralToken: string;
}

interface UseUpdatePositionParams {
  position: any | null;
  collateralAmount?: Big;
  borrowAmount?: Big;
  interestRate?: number;
  collateralToken?: Token;
  onSuccess?: () => void;
}

export function useUpdatePosition({
  position,
  collateralAmount,
  borrowAmount,
  interestRate,
  collateralToken,
  onSuccess,
}: UseUpdatePositionParams) {
  const { address } = useAccount();
  const transactionStore = useTransactionStore();

  // Transaction state management - keep Big instances for precision
  const transactionState = useTransactionState<UpdateFormData>({
    initialFormData: {
      collateralAmount: position?.collateralAmount,
      borrowAmount: position?.borrowedAmount,
      interestRate: position ? getInterestRatePercentage(position) : 5,
      selectedCollateralToken: collateralToken?.symbol || UBTC_TOKEN.symbol,
    },
  });

  // Use the adjust trove hook - now with Big instances
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
    collateralToken: collateralToken || UBTC_TOKEN,
    isZombie:
      position &&
      position.status === "redeemed" &&
      position.borrowedAmount.gt(0) &&
      position.borrowedAmount.lt(MIN_DEBT),
  });

  // Create a wrapped send function that manages state transitions
  const send = useCallback(async () => {
    const hash = await adjustTroveSend();

    if (hash) {
      // Transaction was sent successfully, move to pending
      transactionState.updateFormData({
        collateralAmount,
        borrowAmount,
        interestRate: interestRate || 5,
        selectedCollateralToken: collateralToken?.symbol || UBTC_TOKEN.symbol,
      });
      transactionState.setPending(hash);

      // Add to transaction store
      if (address && position) {
        const description = createTransactionDescription("adjust", {
          hasCollateralChange: changes?.hasCollateralChange || false,
          isCollIncrease: changes?.isCollIncrease || false,
          collateralChange: changes?.collateralChange
            ? bigintToDecimal(changes.collateralChange, 18)
            : 0,
          hasDebtChange: changes?.hasDebtChange || false,
          isDebtIncrease: changes?.isDebtIncrease || false,
          debtChange: changes?.debtChange
            ? bigintToDecimal(changes.debtChange, 18)
            : 0,
          hasInterestRateChange: changes?.hasInterestRateChange || false,
          newInterestRate: interestRate,
          collateralToken: collateralToken?.symbol || UBTC_TOKEN.symbol,
        });

        const transactionData = {
          hash,
          type: "adjust" as const,
          description,
          details: {
            troveId: position.id,
            previousCollateral: Number(position.collateralAmount.toString()),
            previousDebt: Number(position.borrowedAmount.toString()),
            newCollateral: collateralAmount ? Number(collateralAmount.toString()) : undefined,
            newDebt: borrowAmount ? Number(borrowAmount.toString()) : undefined,
            previousInterestRate: getInterestRatePercentage(position),
            newInterestRate: interestRate,
            collateralToken: collateralToken?.symbol || UBTC_TOKEN.symbol,
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
    collateralToken,
    address,
    position,
    changes,
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
