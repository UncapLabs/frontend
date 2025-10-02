import { useMemo, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { contractCall } from "~/lib/contracts/calls";
import { useTransaction } from "./use-transaction";
import { useTransactionState } from "./use-transaction-state";
import {
  type Collateral,
  type CollateralId,
  requiresWrapping,
  generateUnwrapCallFromBigint,
} from "~/lib/collateral";
import { useTransactionStore } from "~/providers/transaction-provider";
import { createTransactionDescription } from "~/lib/transaction-descriptions";
import { bigToBigint } from "~/lib/decimal";
import type { Call } from "starknet";
import Big from "big.js";

interface SurplusAmount {
  collateral: Collateral;
  amount: Big;
}

interface UseClaimAllSurplusParams {
  collaterals: Collateral[];
  surplusAmounts?: SurplusAmount[];
  onSuccess?: () => void;
}

export function useClaimAllSurplus({
  collaterals,
  surplusAmounts,
  onSuccess,
}: UseClaimAllSurplusParams) {
  const { address } = useAccount();
  const transactionStore = useTransactionStore();

  // Transaction state management
  const transactionState = useTransactionState({
    initialFormData: {},
  });

  // Prepare the calls - one for each collateral type with surplus
  const calls = useMemo(() => {
    if (!address || collaterals.length === 0) {
      return undefined;
    }

    const callList: Call[] = [];

    // Create a call for each collateral type that has surplus
    // Must use borrowerOperations.claimCollateral, not collSurplusPool directly
    collaterals.forEach((collateral) => {
      callList.push(
        contractCall.borrowerOperations.claimCollateral(
          address,
          collateral.id as CollateralId
        )
      );

      // For wrapped collateral: add unwrap call after claiming to return underlying token
      if (requiresWrapping(collateral)) {
        const surplus = surplusAmounts?.find(
          (s) => s.collateral.id === collateral.id
        );

        if (surplus && surplus.amount.gt(0)) {
          // Convert Big amount to bigint (wrapped token decimals)
          const surplusBigint = bigToBigint(surplus.amount, collateral.decimals);
          callList.push(generateUnwrapCallFromBigint(collateral, surplusBigint));
        }
      }
    });

    return callList;
  }, [address, collaterals, surplusAmounts]);

  // Use the generic transaction hook
  const transaction = useTransaction(calls);

  // Create a wrapped send function that manages state transitions
  const send = useCallback(async () => {
    const hash = await transaction.send();

    if (hash) {
      // Transaction was sent successfully, move to pending
      transactionState.setPending(hash);

      // Add to transaction store
      if (address) {
        const transactionData = {
          hash,
          type: "claim_surplus" as const,
          description: createTransactionDescription("claim_surplus", {
            collateralToken:
              collaterals.length === 1
                ? collaterals[0].symbol
                : `${collaterals.length} types`,
          }),
          details: {
            collaterals: collaterals.map((c) => c.symbol),
            count: collaterals.length,
          },
        };

        transactionStore.addTransaction(address, transactionData);
      }
    }
    // If no hash returned, transaction.send already handles the error
  }, [transaction, transactionState, transactionStore, collaterals, address]);

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
