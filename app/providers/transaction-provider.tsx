import React from "react";
import { useAccount, useProvider } from "@starknet-react/core";
import { useQueryClient } from "@tanstack/react-query";
import {
  type TransactionStore,
  createTransactionStore,
} from "~/lib/transaction-store";
import { useTRPC, useTRPCClient } from "~/lib/trpc";
import type {
  TransactionStatus,
  BorrowDetails,
  AdjustDetails,
  CloseDetails,
  DepositDetails,
  WithdrawDetails,
} from "~/types/transaction";
import { getBranchId, type CollateralId } from "~/lib/collateral";

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
  const trpcClient = useTRPCClient();

  // Use existing store if it exists, or lazily create one
  const [store] = React.useState(
    () => storeSingleton ?? (storeSingleton = createTransactionStore())
  );

  const pollForTrove = React.useCallback(
    async ({
      troveId,
      maxAttempts = 5,
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
        } catch {
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

        if (transaction?.type === "borrow") {
          const details = transaction.details as BorrowDetails | undefined;
          if (!details?.troveId) return;
          // Poll for the specific troveId
          await pollForTrove({
            troveId: details.troveId,
            onComplete: async () => {
              // Clear server-side branch TCR cache if collateral type is known
              if (details?.collateralType) {
                await trpcClient.cacheRouter.clearKeys.mutate({
                  keys: [`branch-tcr-${details.collateralType}`],
                });
              }

              queryClient.invalidateQueries({
                queryKey: trpc.positionsRouter.getUserOnChainPositions.queryKey(
                  {
                    userAddress: address,
                  }
                ),
              });

              // Invalidate getNextOwnerIndex for borrow transactions
              if (details?.collateralType) {
                queryClient.invalidateQueries({
                  queryKey: trpc.positionsRouter.getNextOwnerIndex.queryKey({
                    borrower: address,
                    collateralType: details.collateralType as CollateralId,
                  }),
                });

                // Invalidate branch TCR data
                queryClient.invalidateQueries({
                  queryKey: trpc.branchRouter.getTCR.queryKey({
                    branchId: details.collateralType as CollateralId,
                  }),
                });

                // Invalidate interest rate data (visualization and chart)
                const branchId = getBranchId(
                  details.collateralType as CollateralId
                );
                queryClient.invalidateQueries({
                  queryKey:
                    trpc.interestRouter.getInterestRateVisualizationData.queryKey(
                      {
                        branchId,
                      }
                    ),
                });
                queryClient.invalidateQueries({
                  queryKey:
                    trpc.interestRouter.getInterestRateChartData.queryKey({
                      branchId,
                    }),
                });
              }
            },
          });
        } else if (transaction?.type === "adjust") {
          const details = transaction.details as AdjustDetails | undefined;
          if (!details?.troveId) return;
          // For adjust transactions, invalidate the specific position
          setTimeout(async () => {
            // Clear server-side branch TCR cache if collateral type is known
            if (details?.collateralType) {
              await trpcClient.cacheRouter.clearKeys.mutate({
                keys: [`branch-tcr-${details.collateralType}`],
              });
            }

            // Invalidate user positions list
            queryClient.invalidateQueries({
              queryKey: trpc.positionsRouter.getUserOnChainPositions.queryKey({
                userAddress: address,
              }),
            });

            // Invalidate the specific position by ID
            if (details?.troveId) {
              console.log(
                "[Transaction Provider] Invalidating position:",
                details.troveId
              );
              queryClient.invalidateQueries({
                queryKey: trpc.positionsRouter.getPositionById.queryKey({
                  troveId: details.troveId,
                }),
              });
            }

            // Invalidate interest rate data if collateral type is known
            if (details?.collateralType) {
              // Invalidate branch TCR data
              queryClient.invalidateQueries({
                queryKey: trpc.branchRouter.getTCR.queryKey({
                  branchId: details.collateralType as CollateralId,
                }),
              });

              const branchId = getBranchId(
                details.collateralType as CollateralId
              );
              queryClient.invalidateQueries({
                queryKey:
                  trpc.interestRouter.getInterestRateVisualizationData.queryKey(
                    {
                      branchId,
                    }
                  ),
              });
              queryClient.invalidateQueries({
                queryKey: trpc.interestRouter.getInterestRateChartData.queryKey(
                  {
                    branchId,
                  }
                ),
              });
            }
          }, 2000);
        } else if (transaction?.type === "close") {
          const details = transaction.details as CloseDetails | undefined;
          if (!details?.troveId) return;
          // For close transactions, invalidate positions after a delay
          setTimeout(async () => {
            // Clear server-side branch TCR cache if collateral type is known
            if (details?.collateralType) {
              await trpcClient.cacheRouter.clearKeys.mutate({
                keys: [`branch-tcr-${details.collateralType}`],
              });

              // Invalidate branch TCR data
              queryClient.invalidateQueries({
                queryKey: trpc.branchRouter.getTCR.queryKey({
                  branchId: details.collateralType as CollateralId,
                }),
              });
            }

            // Invalidate user positions list
            queryClient.invalidateQueries({
              queryKey: trpc.positionsRouter.getUserOnChainPositions.queryKey({
                userAddress: address,
              }),
            });
          }, 2000);
        } else if (
          transaction?.type === "deposit" ||
          transaction?.type === "withdraw"
        ) {
          const details = transaction.details as
            | DepositDetails
            | WithdrawDetails
            | undefined;
          // For stability pool transactions, wait a bit for the chain to update
          // then clear server cache and invalidate queries
          setTimeout(async () => {
            // Bust server-side cache if pool (collateral type) is known
            if (details?.pool) {
              // Clear server-side KV cache for this collateral type
              await trpcClient.cacheRouter.clearKeys.mutate({
                keys: [
                  `stability-pool-deposits-${details.pool}`,
                  `stability-pool-apr-${details.pool}`,
                ],
              });

              // Now invalidate client-side queries to trigger refetch with fresh data
              queryClient.invalidateQueries({
                queryKey: trpc.stabilityPoolRouter.getAllPositions.queryKey({
                  userAddress: address,
                }),
              });

              queryClient.invalidateQueries({
                queryKey: trpc.stabilityPoolRouter.getPoolApr.queryKey({
                  collateralType: details.pool as CollateralId,
                }),
              });

              queryClient.invalidateQueries({
                queryKey: trpc.stabilityPoolRouter.getTotalDeposits.queryKey({
                  collateralType: details.pool as CollateralId,
                }),
              });
            }
          }, 2000);
        }
      }
    },
    [address, queryClient, trpc, trpcClient, store, pollForTrove]
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
