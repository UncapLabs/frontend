import { useMemo, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { useTransaction } from "~/hooks/use-transaction";
import { useTransactionState } from "~/hooks/use-transaction-state";
import { contractCall } from "~/lib/contracts/calls";
import {
  type CollateralType,
  requiresWrapping,
  getCollateralAddresses,
} from "~/lib/contracts/constants";
import { useTransactionStore } from "~/providers/transaction-provider";
import { createTransactionDescription } from "~/lib/transaction-descriptions";
import { extractTroveId } from "~/lib/utils/position-helpers";
import Big from "big.js";

// Close trove form data structure
export interface CloseTroveFormData {
  troveId: string;
  debt: Big;
  collateral: Big;
  collateralType: CollateralType;
}

interface UseCloseTroveParams {
  troveId?: string;
  debt?: Big;
  collateral?: Big;
  collateralType?: CollateralType;
  onSuccess?: () => void;
}

export function useCloseTrove({
  troveId,
  debt,
  collateral,
  collateralType = "UBTC",
  onSuccess,
}: UseCloseTroveParams) {
  const { address } = useAccount();
  const transactionStore = useTransactionStore();

  // Transaction state management
  const transactionState = useTransactionState<CloseTroveFormData>({
    initialFormData: {
      troveId: troveId || "",
      debt: debt || new Big(0),
      collateral: collateral || new Big(0),
      collateralType,
    },
  });

  // Prepare the call
  const calls = useMemo(() => {
    if (!troveId) {
      return undefined;
    }

    try {
      const numericTroveId = extractTroveId(troveId);
      const callList = [
        contractCall.borrowerOperations.closeTrove(
          numericTroveId,
          collateralType
        ),
      ];

      // For WMWBTC: unwrap after closing to return underlying token
      if (requiresWrapping(collateralType) && collateral) {
        const addresses = getCollateralAddresses(collateralType);
        const collateralBigint = BigInt(
          collateral.times(10 ** 18).toFixed(0)
        ); // Convert to 18 decimal bigint

        callList.push(
          contractCall.collateralWrapper.unwrap(
            addresses.collateral, // Wrapper address
            collateralBigint
          )
        );
      }

      return callList;
    } catch {
      // If we can't parse the trove ID, return undefined
      return undefined;
    }
  }, [troveId, collateralType, collateral]);

  // Use the generic transaction hook
  const transaction = useTransaction(calls);

  // Create a wrapped send function that manages state transitions
  const send = useCallback(async () => {
    const hash = await transaction.send();

    if (hash) {
      // Transaction was sent successfully, move to pending
      transactionState.updateFormData({
        troveId: troveId || "",
        debt: debt || new Big(0),
        collateral: collateral || new Big(0),
        collateralType,
      });
      transactionState.setPending(hash);

      // Add to transaction store
      if (address && troveId) {
        const transactionData = {
          hash,
          type: "close" as const,
          description: createTransactionDescription("close", {
            debt,
            collateral,
            collateralType,
          }),
          details: {
            troveId,
            debt,
            collateral,
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
    troveId,
    debt,
    collateral,
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
