import { useMemo, useCallback } from "react";
import { useAccount, useTransactionReceipt } from "@starknet-react/core";
import { contractCall } from "~/lib/contracts/calls";
import { useNextOwnerIndex } from "./use-next-owner-index";
import { useTransaction } from "./use-transaction";
import {
  useTransactionState,
  TRANSACTION_STORAGE_KEYS,
} from "./use-transaction-state";
import {
  getCollateralAddresses,
  UBTC_TOKEN,
  GAS_TOKEN_ADDRESS,
  type CollateralType,
} from "~/lib/contracts/constants";
import type { Token } from "~/components/token-input";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";

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
  const queryClient = useQueryClient();
  const trpc = useTRPC();

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
    storageKey: TRANSACTION_STORAGE_KEYS.borrow,
    initialFormData: {
      collateralAmount: undefined,
      borrowAmount: undefined,
      interestRate: 5, // Default to 5% APR
      selectedCollateralToken: UBTC_TOKEN.symbol,
    },
  });

  // Prepare the calls using our new abstraction
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
        BigInt(Math.floor(collateralAmount * 1e18))
      ),

      // 2. Approve STRK for gas payment
      contractCall.token.approve(
        GAS_TOKEN_ADDRESS,
        addresses.borrowerOperations,
        BigInt(50e18) // Approve 50 STRK for gas fees
      ),

      // 3. Open trove
      contractCall.borrowerOperations.openTrove({
        owner: address,
        ownerIndex: nextOwnerIndex,
        collAmount: BigInt(Math.floor(collateralAmount * 1e18)),
        usduAmount: BigInt(Math.floor(borrowAmount * 1e18)),
        annualInterestRate: BigInt(Math.floor((interestRate * 1e18) / 100)),
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
  ]);

  // Use the generic transaction hook
  const transaction = useTransaction(calls);

  // Watch for persisted transaction if we're in pending state
  const persistedTxReceipt = useTransactionReceipt({
    hash:
      transactionState.currentState === "pending" &&
      transactionState.transactionHash &&
      !transaction.transactionHash
        ? transactionState.transactionHash
        : undefined,
    watch: true,
  });

  // Create a wrapped send function that manages state transitions
  const send = useCallback(async () => {
    try {
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
      }
      // If no hash returned, transaction.send already handles the error
    } catch (error) {
      // User rejected or error occurred - just re-throw
      throw error;
    }
  }, [
    transaction,
    transactionState,
    collateralAmount,
    borrowAmount,
    interestRate,
    collateralToken,
  ]);

  // Check if we need to update state based on transaction status
  // This is purely derived state - no side effects
  if (transactionState.currentState === "pending") {
    // Check active transaction first
    if (transaction.isSuccess) {
      transactionState.setSuccess();

      // Just invalidate to trigger polling when transaction is successful
      if (
        address &&
        transactionState.formData.collateralAmount &&
        transactionState.formData.borrowAmount &&
        collateralToken
      ) {
        queryClient.invalidateQueries({
          queryKey: trpc.positionsRouter.getUserOnChainPositions.queryKey({
            userAddress: address,
          }),
        });
      }

      // Call custom onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } else if (transaction.isError && transaction.error) {
      transactionState.setError(transaction.error);
    }
    // Check persisted transaction (after page refresh)
    else if (persistedTxReceipt.data) {
      transactionState.setSuccess();

      // Just invalidate to trigger polling when transaction is confirmed after refresh
      if (
        address &&
        transactionState.formData.collateralAmount &&
        transactionState.formData.borrowAmount &&
        collateralToken
      ) {
        queryClient.invalidateQueries({
          queryKey: trpc.positionsRouter.getUserOnChainPositions.queryKey({
            userAddress: address,
          }),
        });
      }

      // Call custom onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } else if (persistedTxReceipt.isError && persistedTxReceipt.error) {
      // Check if this is just an RPC issue (transaction not found)
      const errorMessage = persistedTxReceipt.error.message || "";
      const isTransactionNotFound =
        errorMessage.includes("Transaction hash not found") ||
        errorMessage.includes("starknet_getTransactionReceipt");

      // Only set error if it's not a "transaction not found" error
      // This prevents RPC sync issues from being treated as transaction failures
      if (!isTransactionNotFound) {
        transactionState.setError(persistedTxReceipt.error);
      }
      // If transaction not found, stay in pending - it might still be processing
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
