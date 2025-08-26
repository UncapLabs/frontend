import { useMemo, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { contractCall } from "~/lib/contracts/calls";
import { useTransaction } from "./use-transaction";
import { useTransactionState } from "./use-transaction-state";
import { type CollateralType } from "~/lib/contracts/constants";
import { useTransactionStore } from "~/providers/transaction-provider";
import { createTransactionDescription } from "~/lib/transaction-descriptions";

// Claim surplus form data structure
export interface ClaimSurplusFormData {
  collateralType: CollateralType;
  amount?: number;
}

interface UseClaimSurplusParams {
  collateralType: CollateralType;
  onSuccess?: () => void;
}

export function useClaimSurplus({ 
  collateralType,
  onSuccess,
}: UseClaimSurplusParams) {
  const { address } = useAccount();
  const transactionStore = useTransactionStore();

  // Transaction state management
  const transactionState = useTransactionState<ClaimSurplusFormData>({
    initialFormData: {
      collateralType,
      amount: undefined,
    },
  });

  // Prepare the calls
  const calls = useMemo(() => {
    if (!address) {
      return undefined;
    }

    return [
      contractCall.collSurplusPool.claimColl(address, collateralType),
    ];
  }, [address, collateralType]);

  // Use the generic transaction hook
  const transaction = useTransaction(calls);

  // Create a wrapped send function that manages state transitions
  const send = useCallback(async () => {
    const hash = await transaction.send();

    if (hash) {
      // Transaction was sent successfully, move to pending
      transactionState.updateFormData({
        collateralType,
      });
      transactionState.setPending(hash);

      // Add to transaction store
      if (address) {
        const transactionData = {
          hash,
          type: "claimSurplus" as const,
          description: createTransactionDescription("claimSurplus", {
            collateralType,
          }),
          details: {
            collateralType,
          },
        };

        transactionStore.addTransaction(address, transactionData);
      }
    }
    // If no hash returned, transaction.send already handles the error
  }, [
    transaction,
    transactionState,
    transactionStore,
    collateralType,
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