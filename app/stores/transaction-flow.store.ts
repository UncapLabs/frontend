import { create } from "zustand";
import type {
  TransactionStep,
  TransactionType,
} from "~/types/transaction-flow";

interface TransactionFlowStore {
  // Current transaction state
  currentTransaction: {
    id: string;
    type: TransactionType;
    title: string;
    steps: TransactionStep[];
    currentStepIndex: number;
  } | null;

  // Actions
  startTransaction: (type: TransactionType, steps: TransactionStep[]) => void;
  updateStep: (stepIndex: number, update: Partial<TransactionStep>) => void;
  nextStep: () => void;
  completeTransaction: () => void;
  cancelTransaction: () => void;
}

// Get human-readable title for transaction type
function getTransactionTitle(type: TransactionType): string {
  const titles: Record<TransactionType, string> = {
    borrow: "Borrow bitUSD",
    stake: "Stake bitUSD",
  };
  return titles[type];
}

export const useTransactionFlowStore = create<TransactionFlowStore>((set) => ({
  currentTransaction: null,

  startTransaction: (type, steps) => {
    set(() => ({
      currentTransaction: {
        id: crypto.randomUUID(),
        type,
        title: getTransactionTitle(type),
        steps,
        currentStepIndex: 0,
      },
    }));
  },

  updateStep: (stepIndex, update) => {
    set((state) => {
      if (!state.currentTransaction || !state.currentTransaction.steps[stepIndex]) {
        return state;
      }

      return {
        ...state,
        currentTransaction: {
          ...state.currentTransaction,
          steps: state.currentTransaction.steps.map((step, index) =>
            index === stepIndex ? { ...step, ...update } : step
          ),
        },
      };
    });
  },

  nextStep: () => {
    set((state) => {
      if (!state.currentTransaction) return state;

      const nextIndex = state.currentTransaction.currentStepIndex + 1;
      if (nextIndex >= state.currentTransaction.steps.length) {
        return { ...state, currentTransaction: null };
      }

      return {
        ...state,
        currentTransaction: {
          ...state.currentTransaction,
          currentStepIndex: nextIndex,
        },
      };
    });
  },

  completeTransaction: () => {
    set(() => ({ currentTransaction: null }));
  },

  cancelTransaction: () => {
    set(() => ({ currentTransaction: null }));
  },
}));

// Selector hooks
export const useCurrentTransaction = () =>
  useTransactionFlowStore((state) => state.currentTransaction);

export const useTransactionActions = () => {
  const startTransaction = useTransactionFlowStore((state) => state.startTransaction);
  const updateStep = useTransactionFlowStore((state) => state.updateStep);
  const nextStep = useTransactionFlowStore((state) => state.nextStep);
  const completeTransaction = useTransactionFlowStore((state) => state.completeTransaction);
  const cancelTransaction = useTransactionFlowStore((state) => state.cancelTransaction);

  return {
    startTransaction,
    updateStep,
    nextStep,
    completeTransaction,
    cancelTransaction,
  };
};