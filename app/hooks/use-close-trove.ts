import { useMemo, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { useTransaction } from "~/hooks/use-transaction";
import { useTransactionState } from "~/hooks/use-transaction-state";
import { contractCall } from "~/lib/contracts/calls";
import { type Collateral, DEFAULT_COLLATERAL } from "~/lib/collateral";
import { useTransactionStore } from "~/providers/transaction-provider";
import { createTransactionDescription } from "~/lib/transaction-descriptions";
import { extractTroveId } from "~/lib/utils/position-helpers";
import { bigToBigint } from "~/lib/decimal";
import Big from "big.js";
import { generateUnwrapCallFromBigint, requiresWrapping } from "~/lib/collateral/wrapping";

// Close trove form data structure
export interface CloseTroveFormData {
  troveId: string;
  debt: Big;
  collateralAmount: Big;
  collateralSymbol: string;
}

interface UseCloseTroveParams {
  troveId?: string;
  debt?: Big;
  collateralAmount?: Big;
  collateral?: Collateral;
  onSuccess?: () => void;
}

export function useCloseTrove({
  troveId,
  debt,
  collateralAmount,
  collateral,
  onSuccess,
}: UseCloseTroveParams) {
  const { address } = useAccount();
  const transactionStore = useTransactionStore();

  // Transaction state management
  const transactionState = useTransactionState<CloseTroveFormData>({
    initialFormData: {
      troveId: troveId || "",
      debt: debt || new Big(0),
      collateralAmount: collateralAmount || new Big(0),
      collateralSymbol: collateral?.symbol || DEFAULT_COLLATERAL.id,
    },
  });

  // Prepare the call
  const calls = useMemo(() => {
    if (!troveId || !collateral) {
      return undefined;
    }

    try {
      const numericTroveId = extractTroveId(troveId);
      const callList = [
        contractCall.borrowerOperations.closeTrove(
          numericTroveId,
          collateral.id
        ),
      ];

      // For wrapped collateral: unwrap after closing to return underlying token
      if (requiresWrapping(collateral) && collateralAmount) {
        const wrappedAmount = bigToBigint(
          collateralAmount,
          collateral.decimals
        );
        callList.push(generateUnwrapCallFromBigint(collateral, wrappedAmount));
      }

      return callList;
    } catch {
      // If we can't parse the trove ID, return undefined
      return undefined;
    }
  }, [troveId, collateral, collateralAmount]);

  // Use the generic transaction hook
  const transaction = useTransaction();

  // Create a wrapped send function that manages state transitions
  const send = useCallback(async () => {
    if (!calls) {
      throw new Error("Transaction not ready");
    }
    const hash = await transaction.send(calls);

    if (hash) {
      // Transaction was sent successfully, move to pending
      transactionState.updateFormData({
        troveId: troveId || "",
        debt: debt || new Big(0),
        collateralAmount: collateralAmount || new Big(0),
        collateralSymbol: collateral?.symbol || DEFAULT_COLLATERAL.id,
      });
      transactionState.setPending(hash);

      // Add to transaction store
      if (address && troveId && collateral) {
        const transactionData = {
          hash,
          type: "close" as const,
          description: createTransactionDescription("close", {
            debt,
            collateral: collateralAmount,
            collateralToken: collateral.symbol,
          }),
          details: {
            troveId,
            debt,
            collateral: collateralAmount,
            collateralToken: collateral.symbol,
          },
        };

        transactionStore.addTransaction(address, transactionData);
      }
    }
    // If no hash returned, transaction.send already handles the error
  }, [
    calls,
    transaction,
    transactionState,
    transactionStore,
    troveId,
    debt,
    collateralAmount,
    collateral,
    address,
  ]);

  // Check if we need to update state based on transaction status
  // This is purely derived state - no side effects
  if (transactionState.currentState === "pending") {
    // Check active transaction first
    if (transaction.isSuccess) {
      transactionState.setSuccess();

      // Call custom onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } else if (transaction.isError && transaction.error) {
      transactionState.setError(transaction.error);
    }
  }

  return {
    ...transaction,
    ...transactionState,
    send, // Override send with our wrapped version
    isReady: !!calls,
    // Pass through isSending for UI state
    isSending: transaction.isSending,
  };
}
