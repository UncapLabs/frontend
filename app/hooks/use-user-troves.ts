import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";

export function useUserTroves(address: `0x${string}` | undefined) {
  const trpc = useTRPC();

  const {
    data: trovesData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    trpc.positionsRouter.getUserOnChainPositions.queryOptions(
      {
        userAddress: address as `0x${string}`,
      },
      { enabled: !!address }
    )
  );

  const troves = trovesData?.positions || [];

  return {
    troves,
    isLoading,
    error,
    refetch,
    hasActiveTroves: troves.length > 0,
  };
}
