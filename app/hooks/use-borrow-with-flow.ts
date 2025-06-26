import { useMemo } from "react";
import { useBorrowTransaction } from "./use-borrow-transaction";
import {
  useTransactionActions,
  useCurrentTransaction,
} from "~/stores/transaction-flow.store";
import type { TransactionStep } from "~/types/transaction-flow";

interface UseBorrowWithFlowParams {
  collateralAmount?: number;
  borrowAmount?: number;
  annualInterestRate: bigint;
}

export function useBorrowWithFlow({
  collateralAmount,
  borrowAmount,
  annualInterestRate,
}: UseBorrowWithFlowParams): ReturnType<typeof useBorrowTransaction> & {
  send: () => Promise<void>;
  hasActiveFlow: boolean;
} {
  const transaction = useBorrowTransaction({
    collateralAmount,
    borrowAmount,
    annualInterestRate,
  });

  const { startTransaction, updateStep, completeTransaction } =
    useTransactionActions();
  const currentTransaction = useCurrentTransaction();

  // Define the transaction steps
  const transactionSteps: TransactionStep[] = useMemo(
    () => [
      {
        id: "approve-tbtc",
        name: "Approve TBTC",
        description: "Approve TBTC spending for collateral",
        state: "idle",
      },
      {
        id: "open-trove",
        name: "Open Trove",
        description: "Create borrowing position",
        state: "idle",
      },
    ],
    []
  );

  // Enhanced send function that manages the flow
  const sendWithFlow = async () => {
    // Start the transaction flow
    startTransaction("borrow", transactionSteps);
    updateStep(0, { state: "loading" });

    try {
      await transaction.send();

      // If we get a transaction hash, update the first step
      if (transaction.data?.transaction_hash) {
        updateStep(0, {
          state: "success",
          transactionHash: transaction.data.transaction_hash,
        });
        updateStep(1, { state: "loading" });
      }
    } catch (error) {
      updateStep(0, {
        state: "error",
        error: error instanceof Error ? error.message : "Transaction failed",
      });
      throw error;
    }
  };

  // Check if transaction is successful and update flow accordingly
  if (transaction.isTransactionSuccess && currentTransaction) {
    const secondStep = currentTransaction.steps[1];
    if (secondStep && secondStep.state !== "success") {
      updateStep(1, {
        state: "success",
        transactionHash: transaction.data?.transaction_hash,
      });
      // Complete the transaction after a delay
      setTimeout(() => completeTransaction(), 2000);
    }
  }

  // Check if transaction failed and update flow accordingly
  if (transaction.isTransactionError && currentTransaction) {
    const stepIndex = transaction.data?.transaction_hash ? 1 : 0;
    const currentStep = currentTransaction.steps[stepIndex];
    if (currentStep && currentStep.state !== "error") {
      const errorMessage =
        transaction.transactionError?.message || "Transaction failed";
      updateStep(stepIndex, { state: "error", error: errorMessage });
    }
  }

  return {
    ...transaction,
    send: sendWithFlow,
    hasActiveFlow: !!currentTransaction,
  };
}
