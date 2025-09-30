import { useMemo, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { contractCall } from "~/lib/contracts/calls";
import { useTransaction } from "./use-transaction";
import { useTransactionState } from "./use-transaction-state";
import {
  type CollateralType,
  requiresWrapping,
  getCollateralAddresses,
} from "~/lib/contracts/constants";
import { useTransactionStore } from "~/providers/transaction-provider";
import { createTransactionDescription } from "~/lib/transaction-descriptions";
import { bigToBigint } from "~/lib/decimal";
import type { Call } from "starknet";
import Big from "big.js";

interface SurplusAmount {
  collateralType: CollateralType;
  amount: Big;
}

interface UseClaimAllSurplusParams {
  collateralTypes: CollateralType[];
  surplusAmounts?: SurplusAmount[];
  onSuccess?: () => void;
}

export function useClaimAllSurplus({
  collateralTypes,
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
    if (!address || collateralTypes.length === 0) {
      return undefined;
    }

    const callList: Call[] = [];

    // Create a call for each collateral type that has surplus
    // Must use borrowerOperations.claimCollateral, not collSurplusPool directly
    collateralTypes.forEach((collateralType) => {
      callList.push(
        contractCall.borrowerOperations.claimCollateral(address, collateralType)
      );

      // For WMWBTC: add unwrap call after claiming to return underlying wBTC
      if (requiresWrapping(collateralType)) {
        const addresses = getCollateralAddresses(collateralType);
        const surplus = surplusAmounts?.find(
          (s) => s.collateralType === collateralType
        );

        if (surplus && surplus.amount.gt(0)) {
          // Convert Big amount to bigint (18 decimals on-chain)
          const surplusBigint = bigToBigint(surplus.amount, 18);

          callList.push(
            contractCall.collateralWrapper.unwrap(
              addresses.collateral, // Wrapper address
              surplusBigint
            )
          );
        }
      }
    });

    return callList;
  }, [address, collateralTypes, surplusAmounts]);

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
            collateralType:
              collateralTypes.length === 1
                ? collateralTypes[0]
                : `${collateralTypes.length} types`,
          }),
          details: {
            collateralTypes,
            count: collateralTypes.length,
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
    collateralTypes,
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
