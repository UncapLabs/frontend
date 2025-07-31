import { useEffect, useState } from 'react';
import { useTransactionStore } from '~/providers/transaction-provider';
import type { StarknetTransaction } from '~/types/transaction';

/**
 * Hook that provides reactive access to transaction store data
 * Automatically updates when transactions change
 */
export function useTransactionStoreData(address: string | undefined) {
  const store = useTransactionStore();
  const [transactions, setTransactions] = useState<StarknetTransaction[]>(() => 
    address ? store.getTransactions(address) : []
  );

  useEffect(() => {
    if (!address) {
      setTransactions([]);
      return;
    }

    // Update transactions immediately
    setTransactions(store.getTransactions(address));

    // Subscribe to changes
    const unsubscribe = store.onChange(() => {
      setTransactions(store.getTransactions(address));
    });

    return unsubscribe;
  }, [store, address]);

  const pendingTransactions = transactions.filter(tx => tx.status === 'pending');
  const pendingCount = pendingTransactions.length;

  return {
    transactions,
    pendingTransactions,
    pendingCount,
  };
}