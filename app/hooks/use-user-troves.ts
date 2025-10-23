import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";

export function useUserTroves(address: `0x${string}` | undefined) {
  const trpc = useTRPC();

  const {
    data: trovesData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    ...trpc.positionsRouter.getUserOnChainPositions.queryOptions(
      {
        userAddress: address as `0x${string}`,
      },
      { enabled: !!address }
    ),
    // Override specific query options for better UX with indexer lag
    staleTime: 45 * 1000, // Consider data stale after 45 seconds (overrides global 60s)
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes when window is focused
    refetchIntervalInBackground: false, // Don't refetch in background to save resources
    refetchOnWindowFocus: true, // Refetch when user comes back to the tab
    refetchOnReconnect: true, // Refetch on network reconnect
    retry: 0, // No retries on frontend - backend handles retries for both indexer and RPC calls
  });

  const troves = trovesData?.positions || [];
  const fetchErrors = trovesData?.errors || [];

  // Log errors to console for debugging
  if (fetchErrors.length > 0) {
    console.warn(
      `[useUserTroves] ${fetchErrors.length} troves failed to load:`,
      fetchErrors
    );
  }

  return {
    troves,
    isLoading,
    isRefetching,
    error,
    refetch,
    hasActiveTroves: troves.length > 0,
    partialDataAvailable: fetchErrors.length > 0 && troves.length > 0,
    failedTroves: fetchErrors,
  };
}
