import { useCallback } from "react";
import {
  useSendTransaction,
  useTransactionReceipt,
} from "@starknet-react/core";
import { type Call } from "starknet";

interface UseTransactionResult {
  send: () => Promise<string | undefined>;
  isPending: boolean;
  isSending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  transactionHash?: string;
  reset: () => void;
}

export function useTransaction(
  calls: Call[] | undefined
): UseTransactionResult {
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

  // Send wrapper that returns the transaction hash
  const send = useCallback(async () => {
    if (!calls) {
      throw new Error("Transaction not ready");
    }
    const result = await sendTransaction(calls);
    return result?.transaction_hash;
  }, [calls, sendTransaction]);

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
