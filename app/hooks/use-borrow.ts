import { useMemo, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { contractCall } from "~/lib/contracts/calls";
import { useNextOwnerIndex } from "./use-next-owner-index";
import { useTransaction } from "./use-transaction";
import { useTransactionState } from "./use-transaction-state";
import {
  getCollateralAddresses,
  UBTC_TOKEN,
  GAS_TOKEN_ADDRESS,
  type CollateralType,
  getBranchId,
} from "~/lib/contracts/constants";
import type { Token } from "~/components/token-input";
import { useTransactionStore } from "~/providers/transaction-provider";
import { createTransactionDescription } from "~/lib/transaction-descriptions";
import { getTroveId, getPrefixedTroveId } from "~/lib/utils/trove-id";
import { decimalToBigint } from "~/lib/decimal";

// Borrow form data structure
export interface BorrowFormData {
  collateralAmount?: number;
  borrowAmount?: number;
  interestRate: number;
  selectedCollateralToken: string;
}

interface TokenWithCollateralType extends Token {
  collateralType?: CollateralType;
}

interface UseBorrowParams {
  collateralAmount?: number;
  borrowAmount?: number;
  interestRate: number;
  collateralToken?: TokenWithCollateralType;
  onSuccess?: () => void;
}

export function useBorrow({
  collateralAmount,
  borrowAmount,
  interestRate,
  collateralToken,
  onSuccess,
}: UseBorrowParams) {
  const { address } = useAccount();
  const transactionStore = useTransactionStore();

  // Determine collateral type from token
  const collateralType: CollateralType =
    collateralToken?.collateralType ||
    (collateralToken?.symbol === "UBTC" ? "UBTC" : "GBTC");

  const { nextOwnerIndex, isLoading: isLoadingNextOwnerIndex } =
    useNextOwnerIndex({
      address,
      collateralType,
    });

  // Transaction state management
  const transactionState = useTransactionState<BorrowFormData>({
    initialFormData: {
      collateralAmount: undefined,
      borrowAmount: undefined,
      interestRate: 5, // Default to 5% APR
      selectedCollateralToken: UBTC_TOKEN.symbol,
    },
  });

  // Prepare the calls
  const calls = useMemo(() => {
    if (
      !address ||
      !collateralAmount ||
      !borrowAmount ||
      !collateralToken ||
      isLoadingNextOwnerIndex ||
      nextOwnerIndex === undefined
    ) {
      return undefined;
    }

    // Get addresses for this collateral type
    const addresses = getCollateralAddresses(collateralType);

    return [
      // 1. Approve collateral token spending
      contractCall.token.approve(
        collateralToken.address,
        addresses.borrowerOperations,
        decimalToBigint(collateralAmount, 18)
      ),

      // 2. Approve STRK for gas payment
      contractCall.token.approve(
        GAS_TOKEN_ADDRESS,
        addresses.borrowerOperations,
        BigInt(1e18) // Approve 1 STRK for gas fees
      ),

      // 3. Open trove
      contractCall.borrowerOperations.openTrove({
        owner: address,
        ownerIndex: nextOwnerIndex,
        collAmount: decimalToBigint(collateralAmount, 18),
        usduAmount: decimalToBigint(borrowAmount, 18),
        annualInterestRate: decimalToBigint(interestRate / 100, 18),
        collateralType: collateralType,
        maxUpfrontFee: 2n ** 256n - 1n,
      }),
    ];
  }, [
    address,
    collateralAmount,
    borrowAmount,
    collateralToken,
    isLoadingNextOwnerIndex,
    nextOwnerIndex,
    interestRate,
    collateralType,
  ]);

  // Use the generic transaction hook
  const transaction = useTransaction(calls);

  // Create a wrapped send function that manages state transitions
  const send = useCallback(async () => {
    const hash = await transaction.send();

    if (hash) {
      // Transaction was sent successfully, move to pending
      // Now we update the form data since user accepted
      transactionState.updateFormData({
        collateralAmount,
        borrowAmount,
        interestRate,
        selectedCollateralToken: collateralToken?.symbol || UBTC_TOKEN.symbol,
      });
      transactionState.setPending(hash);

      // Add to transaction store
      if (address) {
        // Compute the troveId if we have the necessary data
        let troveId: string | undefined;

        if (nextOwnerIndex !== undefined) {
          const computedTroveId = getTroveId(address, nextOwnerIndex);
          const branchId = getBranchId(collateralType);
          troveId = getPrefixedTroveId(branchId, computedTroveId);
        }

        const transactionData = {
          hash,
          type: "borrow" as const,
          description: createTransactionDescription("borrow", {
            collateralAmount,
            borrowAmount,
            interestRate,
            collateralToken: collateralToken?.symbol || UBTC_TOKEN.symbol,
          }),
          details: {
            collateralAmount,
            borrowAmount,
            interestRate,
            collateralToken: collateralToken?.symbol || UBTC_TOKEN.symbol,
            ...(troveId && {
              troveId,
              collateralType,
              ownerIndex: nextOwnerIndex?.toString(), // Convert BigInt to string for JSON serialization
            }),
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
    collateralAmount,
    borrowAmount,
    interestRate,
    collateralToken,
    address,
    collateralType,
    nextOwnerIndex,
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
