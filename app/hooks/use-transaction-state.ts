import { useCallback, useState } from "react";

// Transaction state types
export type TransactionStateType =
  | "idle" // Initial state, no data entered
  | "editing" // User is filling form/preparing transaction
  | "pending" // Transaction submitted, waiting for chain confirmation
  | "success" // Transaction completed successfully
  | "error"; // Transaction failed

// Configuration for the hook
export interface TransactionConfig<TFormData> {
  storageKey: string; // Kept for backward compatibility but not used
  staleTimeout?: number; // Not used anymore
  initialFormData: TFormData;
}

// Hook return type
export interface UseTransactionStateReturn<TFormData> {
  currentState: TransactionStateType;
  formData: TFormData;
  transactionHash?: string;
  error?: { message: string; code?: string };

  // State transitions
  startEditing: () => void;
  setPending: (hash: string) => void;
  setSuccess: () => void;
  setError: (error: Error | { message: string; code?: string }) => void;
  reset: () => void;

  // Form data management
  updateFormData: (data: Partial<TFormData>) => void;
}

export function useTransactionState<TFormData extends Record<string, any>>(
  config: TransactionConfig<TFormData>
): UseTransactionStateReturn<TFormData> {
  const { initialFormData } = config;

  // Use regular React state instead of localStorage
  const [state, setState] = useState<TransactionStateType>("idle");
  const [formData, setFormData] = useState<TFormData>(initialFormData);
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const [errorState, setErrorState] = useState<
    { message: string; code?: string } | undefined
  >();

  // State transition functions
  const startEditing = useCallback(() => {
    setState("editing");
    setErrorState(undefined);
  }, []);

  const setPending = useCallback((hash: string) => {
    setState("pending");
    setTransactionHash(hash);
    setErrorState(undefined);
  }, []);

  const setSuccess = useCallback(() => {
    setState("success");
  }, []);

  const setError = useCallback(
    (error: Error | { message: string; code?: string }) => {
      setState("error");
      setErrorState({
        message: error.message,
        code: "code" in error ? error.code : undefined,
      });
    },
    []
  );

  const reset = useCallback(() => {
    setState("idle");
    setFormData(initialFormData);
    setTransactionHash(undefined);
    setErrorState(undefined);
  }, [initialFormData]);

  const updateFormData = useCallback((data: Partial<TFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    // Automatically transition to editing if we're in idle state
    setState((current) => (current === "idle" ? "editing" : current));
  }, []);

  return {
    currentState: state,
    formData,
    transactionHash,
    error: errorState,
    startEditing,
    setPending,
    setSuccess,
    setError,
    reset,
    updateFormData,
  };
}

// Storage keys for different transaction types
export const TRANSACTION_STORAGE_KEYS = {
  borrow: "tx_borrow",
  claimRewards: "tx_claim_rewards",
  modifyTrove: "tx_modify_trove",
  repay: "tx_repay",
  addCollateral: "tx_add_collateral",
  withdrawCollateral: "tx_withdraw_collateral",
} as const;
