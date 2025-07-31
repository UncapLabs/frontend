import React from 'react';
import { useAccount, useProvider } from '@starknet-react/core';
import { useQueryClient } from '@tanstack/react-query';
import {
  type TransactionStore,
  createTransactionStore,
} from '~/lib/transaction-store';
import { useTRPC } from '~/lib/trpc';
import type { TransactionStatus } from '~/types/transaction';

// Only allow a single instance of the store to exist at once
// so that multiple provider instances can share the same store.
let storeSingleton: ReturnType<typeof createTransactionStore> | undefined;

const TransactionStoreContext = React.createContext<TransactionStore | null>(
  null,
);

export function TransactionStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { provider } = useProvider();
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  // Use existing store if it exists, or lazily create one
  const [store] = React.useState(
    () => storeSingleton ?? (storeSingleton = createTransactionStore()),
  );

  const onTransactionStatus = React.useCallback(
    (status: TransactionStatus) => {
      if (status === 'success' && address) {
        // Invalidate relevant queries when transactions succeed
        queryClient.invalidateQueries({
          queryKey: trpc.positionsRouter.getUserOnChainPositions.queryKey({
            userAddress: address,
          }),
        });
      }
    },
    [address, queryClient, trpc],
  );

  // Keep store provider up to date
  React.useEffect(() => {
    store.setProvider(provider);
  }, [store, provider]);

  // Wait for pending transactions whenever address changes
  React.useEffect(() => {
    if (address) {
      store.waitForPendingTransactions(address);
    }
  }, [store, address]);


  React.useEffect(() => {
    if (store && address) {
      return store.onTransactionStatus(onTransactionStatus);
    }
  }, [store, address, onTransactionStatus]);

  return (
    <TransactionStoreContext.Provider value={store}>
      {children}
    </TransactionStoreContext.Provider>
  );
}

export function useTransactionStore(): TransactionStore {
  const store = React.useContext(TransactionStoreContext);

  if (!store) {
    throw new Error('Transaction hooks must be used within TransactionStoreProvider');
  }

  return store;
}