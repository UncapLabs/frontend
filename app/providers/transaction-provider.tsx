import React from "react";
import { useAccount, useProvider } from "@starknet-react/core";
import { useQueryClient } from "@tanstack/react-query";
import {
  type TransactionStore,
  createTransactionStore,
} from "~/lib/transaction-store";
import { useTRPC } from "~/lib/trpc";
import type { TransactionStatus } from "~/types/transaction";

// Only allow a single instance of the store to exist at once
// so that multiple provider instances can share the same store.
let storeSingleton: ReturnType<typeof createTransactionStore> | undefined;

const TransactionStoreContext = React.createContext<TransactionStore | null>(
  null
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
    () => storeSingleton ?? (storeSingleton = createTransactionStore())
  );

  const pollForTrove = React.useCallback(
    async ({
      troveId,
      maxAttempts = 15,
      interval = 2000,
      onComplete,
    }: {
      troveId: string;
      maxAttempts?: number;
      interval?: number;
      onComplete: () => void;
    }) => {
      let attempts = 0;

      const poll = async () => {
        attempts++;

        try {
          // Fetch specific position by ID instead of all positions
          const data = await queryClient.fetchQuery(
            trpc.positionsRouter.getPositionById.queryOptions({
              troveId,
            })
          );

          if (data.position || attempts >= maxAttempts) {
            onComplete();
          } else {
            setTimeout(poll, interval);
          }
        } catch (error) {
          // On error, try again until max attempts
          if (attempts < maxAttempts) {
            setTimeout(poll, interval);
          } else {
            onComplete();
          }
        }
      };

      // Start polling after initial delay
      setTimeout(poll, 2000);
    },
    [queryClient, trpc]
  );

  const onTransactionStatus = React.useCallback(
    async (status: TransactionStatus, hash: string) => {
      if (status === "success" && address) {
        // Get transaction details from store
        const transaction = store.getTransaction(address, hash);

        if (transaction?.type === "borrow" && transaction.details?.troveId) {
          // Poll for the specific troveId
          await pollForTrove({
            troveId: transaction.details.troveId,
            onComplete: () => {
              queryClient.invalidateQueries({
                queryKey: trpc.positionsRouter.getUserOnChainPositions.queryKey(
                  {
                    userAddress: address,
                  }
                ),
              });

              // Invalidate getNextOwnerIndex for borrow transactions
              if (transaction.details?.collateralType) {
                queryClient.invalidateQueries({
                  queryKey: trpc.positionsRouter.getNextOwnerIndex.queryKey({
                    borrower: address,
                    collateralType: transaction.details.collateralType,
                  }),
                });
              }
            },
          });
        } else {
          // Fallback for other transaction types
          setTimeout(() => {
            queryClient.invalidateQueries({
              queryKey: trpc.positionsRouter.getUserOnChainPositions.queryKey({
                userAddress: address,
              }),
            });
          }, 6000);
        }
      }
    },
    [address, queryClient, trpc, store, pollForTrove]
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
    throw new Error(
      "Transaction hooks must be used within TransactionStoreProvider"
    );
  }

  return store;
}
