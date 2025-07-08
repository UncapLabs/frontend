import { useCallback } from "react";
import {
  useSendTransaction,
  useTransactionReceipt,
} from "@starknet-react/core";
import { type Call } from "starknet";

interface UseTransactionResult {
  send: () => Promise<void>;
  isPending: boolean;
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
    send: sendTransaction,
    data,
    isPending: isSending,
    isError: isSendError,
    error: sendError,
    reset: resetSend,
  } = useSendTransaction({
    calls,
  });

  // Watch for transaction receipt
  const {
    data: receipt,
    isSuccess: isReceiptSuccess,
    isError: isReceiptError,
    error: receiptError,
  } = useTransactionReceipt({
    hash: data?.transaction_hash,
    watch: true,
  });

  // Derive transaction state
  const transactionHash = data?.transaction_hash;
  const isPending =
    isSending || (!!transactionHash && !isReceiptSuccess && !isReceiptError);
  const isSuccess = isReceiptSuccess && !!receipt;
  const isError = isSendError || isReceiptError;
  const error = sendError || receiptError || null;

  // Simple send wrapper
  const send = useCallback(async () => {
    if (!calls) {
      throw new Error("Transaction not ready");
    }
    await sendTransaction();
  }, [calls, sendTransaction]);

  return {
    send,
    isPending,
    isSuccess,
    isError,
    error,
    transactionHash,
    reset: resetSend,
  };
}
