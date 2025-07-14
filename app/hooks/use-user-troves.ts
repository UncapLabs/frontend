import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";

export function useUserTroves() {
  const { address } = useAccount();
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

  const troves = useMemo(() => {
    return trovesData?.positions || [];
  }, [trovesData]);

  return {
    troves,
    isLoading,
    error,
    refetch,
    hasActiveTroves: troves.length > 0,
  };
}
