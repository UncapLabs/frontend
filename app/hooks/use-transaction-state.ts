import { useCallback, useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";

// Transaction state types
export type TransactionStateType =
  | "idle" // Initial state, no data entered
  | "editing" // User is filling form/preparing transaction
  | "confirming" // Wallet confirmation in progress
  | "pending" // Transaction submitted, waiting for chain confirmation
  | "success" // Transaction completed successfully
  | "error"; // Transaction failed

// Configuration for the hook
export interface TransactionConfig<TFormData> {
  storageKey: string;
  staleTimeout?: number; // Default: 24 hours in milliseconds
  initialFormData: TFormData;
}

// Stored state structure
export interface StoredTransactionState<TFormData> {
  state: TransactionStateType;
  formData: TFormData;
  transactionHash?: string;
  error?: {
    message: string;
    code?: string;
  };
  timestamp: number;
}

// Hook return type
export interface UseTransactionStateReturn<TFormData> {
  currentState: TransactionStateType;
  formData: TFormData;
  transactionHash?: string;
  error?: { message: string; code?: string };

  // State transitions
  startEditing: () => void;
  startConfirming: () => void;
  setPending: (hash: string) => void;
  setSuccess: () => void;
  setError: (error: Error | { message: string; code?: string }) => void;
  reset: () => void;

  // Form data management
  updateFormData: (data: Partial<TFormData>) => void;

  // Utility
  isStale: boolean;
}

// Default stale timeout: 24 hours
const DEFAULT_STALE_TIMEOUT = 24 * 60 * 60 * 1000;

export function useTransactionState<TFormData extends Record<string, any>>(
  config: TransactionConfig<TFormData>
): UseTransactionStateReturn<TFormData> {
  const {
    storageKey,
    staleTimeout = DEFAULT_STALE_TIMEOUT,
    initialFormData,
  } = config;

  // Initialize stored state with defaults
  const defaultStoredState: StoredTransactionState<TFormData> = {
    state: "idle",
    formData: initialFormData,
    timestamp: Date.now(),
  };

  // Use localStorage hook
  const [storedState, setStoredState] = useLocalStorage<
    StoredTransactionState<TFormData>
  >(storageKey, defaultStoredState);

  // Check if data is stale
  const isStale = useMemo(() => {
    const now = Date.now();
    return now - storedState.timestamp > staleTimeout;
  }, [storedState.timestamp, staleTimeout]);

  // Clear stale data on mount if needed
  const cleanedState = useMemo(() => {
    if (isStale && storedState.state !== "pending") {
      // Reset to default if stale (unless transaction is pending)
      return defaultStoredState;
    }
    return storedState;
  }, [isStale, storedState, defaultStoredState]);

  // State transition functions
  const startEditing = useCallback(() => {
    setStoredState((prev) => ({
      ...prev,
      state: "editing",
      timestamp: Date.now(),
      error: undefined,
    }));
  }, [setStoredState]);

  const startConfirming = useCallback(() => {
    setStoredState((prev) => ({
      ...prev,
      state: "confirming",
      timestamp: Date.now(),
    }));
  }, [setStoredState]);

  const setPending = useCallback(
    (hash: string) => {
      setStoredState((prev) => ({
        ...prev,
        state: "pending",
        transactionHash: hash,
        timestamp: Date.now(),
      }));
    },
    [setStoredState]
  );

  const setSuccess = useCallback(() => {
    setStoredState((prev) => ({
      ...prev,
      state: "success",
      timestamp: Date.now(),
    }));
  }, [setStoredState]);

  const setError = useCallback(
    (error: Error | { message: string; code?: string }) => {
      setStoredState((prev) => ({
        ...prev,
        state: "error",
        error: {
          message: error.message,
          code: "code" in error ? error.code : undefined,
        },
        timestamp: Date.now(),
      }));
    },
    [setStoredState]
  );

  const reset = useCallback(() => {
    setStoredState({
      state: "idle",
      formData: initialFormData,
      timestamp: Date.now(),
    });
  }, [setStoredState, initialFormData]);

  const updateFormData = useCallback(
    (data: Partial<TFormData>) => {
      setStoredState((prev) => ({
        ...prev,
        formData: { ...prev.formData, ...data },
        timestamp: Date.now(),
        // Automatically transition to editing if we're in idle state
        state: prev.state === "idle" ? "editing" : prev.state,
      }));
    },
    [setStoredState]
  );

  return {
    currentState: cleanedState.state,
    formData: cleanedState.formData,
    transactionHash: cleanedState.transactionHash,
    error: cleanedState.error,
    startEditing,
    startConfirming,
    setPending,
    setSuccess,
    setError,
    reset,
    updateFormData,
    isStale,
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
