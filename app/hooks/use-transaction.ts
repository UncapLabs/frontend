import { useCallback } from "react";
import {
  useSendTransaction,
  useTransactionReceipt,
} from "@starknet-react/core";
import { type Call } from "starknet";

interface UseTransactionResult {
  send: (calls: Call[]) => Promise<string | undefined>;
  isPending: boolean;
  isSending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  transactionHash?: string;
  reset: () => void;
}

/**
 * Hook for managing transaction state and receipt watching.
 * The caller provides calls at send time, allowing for dynamic call building.
 */
export function useTransaction(): UseTransactionResult {
  // StarkNet transaction hook
  const {
    sendAsync: sendTransaction,
    data,
    isPending: isSending,
    isError: isSendError,
    error: sendError,
    reset: resetSend,
  } = useSendTransaction({});

  // Watch for transaction receipt
  const {
    data: receipt,
    isError: isReceiptError,
    error: receiptError,
  } = useTransactionReceipt({
    hash: data?.transaction_hash,
    watch: true,
    retry: (failureCount, error) => {
      // Check if it's a "transaction not found" error
      const errorMessage = error?.message || "";
      const isTransactionNotFound =
        errorMessage.includes("Transaction hash not found") ||
        errorMessage.includes("starknet_getTransactionReceipt");

      // Retry up to 10 times for "not found" errors
      if (isTransactionNotFound && failureCount < 10) {
        return true;
      }

      // For other errors, use default retry logic (3 times)
      return failureCount < 3;
    },
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s...
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Derive transaction state
  const transactionHash = data?.transaction_hash;
  const isPending =
    isSending || (!!transactionHash && !receipt && !isReceiptError);
  const isSuccess = !!receipt;
  const isError = isSendError || isReceiptError;
  const error = sendError || receiptError || null;

  // Send wrapper that accepts calls and returns the transaction hash
  const send = useCallback(async (calls: Call[]) => {
    const result = await sendTransaction(calls);
    return result?.transaction_hash;
  }, [sendTransaction]);

  return {
    send,
    isPending,
    isSending,
    isSuccess,
    isError,
    error,
    transactionHash,
    reset: resetSend,
  };
}
