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
  } = useQuery(
    trpc.positionsRouter.getUserOnChainPositions.queryOptions(
      {
        userAddress: address as `0x${string}`,
      },
      { enabled: !!address }
    )
  );

  const troves = trovesData?.positions || [];
  const fetchErrors = trovesData?.errors || [];

  // Log errors to console for debugging
  if (fetchErrors.length > 0) {
    console.warn(`[useUserTroves] ${fetchErrors.length} troves failed to load:`, fetchErrors);
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
