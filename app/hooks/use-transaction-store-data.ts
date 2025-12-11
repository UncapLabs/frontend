import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useTransactionStore } from "~/providers/transaction-provider";
import type { StarknetTransaction } from "~/types/transaction";

const EMPTY_TRANSACTIONS: StarknetTransaction[] = [];

/**
 * Hook that provides reactive access to transaction store data
 * Automatically updates when transactions change
 *
 * Uses useSyncExternalStore for proper integration with React's concurrent features
 * and to avoid cascading renders from setState in effects.
 */
export function useTransactionStoreData(address: string | undefined) {
  const store = useTransactionStore();

  const subscribe = useCallback(
    (onStoreChange: () => void) => store.onChange(onStoreChange),
    [store]
  );

  const getSnapshot = useCallback(() => {
    if (!address) {
      return EMPTY_TRANSACTIONS;
    }
    return store.getTransactions(address);
  }, [store, address]);

  const transactions = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const pendingTransactions = useMemo(
    () => transactions.filter((tx) => tx.status === "pending"),
    [transactions]
  );

  return {
    transactions,
    pendingTransactions,
    pendingCount: pendingTransactions.length,
  };
}