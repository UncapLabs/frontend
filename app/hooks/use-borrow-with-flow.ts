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
        id: "open-trove",
        name: "Opening Trove",
        description: "Approving TBTC and creating borrowing position",
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

      // If we get a transaction hash, update with it
      if (transaction.data?.transaction_hash) {
        updateStep(0, {
          state: "loading",
          transactionHash: transaction.data.transaction_hash,
        });
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
    const firstStep = currentTransaction.steps[0];
    if (firstStep && firstStep.state !== "success") {
      updateStep(0, {
        state: "success",
        transactionHash: transaction.data?.transaction_hash,
      });
      // Complete the transaction after a delay
      setTimeout(() => completeTransaction(), 2000);
    }
  }

  // Check if transaction failed and update flow accordingly
  if (transaction.isTransactionError && currentTransaction) {
    const firstStep = currentTransaction.steps[0];
    if (firstStep && firstStep.state !== "error") {
      const errorMessage =
        transaction.transactionError?.message || "Transaction failed";
      updateStep(0, { state: "error", error: errorMessage });
    }
  }

  return {
    ...transaction,
    send: sendWithFlow,
    hasActiveFlow: !!currentTransaction,
  };
}
