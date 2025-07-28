import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";

export function useTroveData(troveId?: string) {
  const trpc = useTRPC();

  const {
    data: positionData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    trpc.positionsRouter.getPositionById.queryOptions(
      {
        troveId: troveId || "",
      },
      { enabled: !!troveId }
    )
  );

  // Extract the position from the response
  const position = positionData?.position || null;

  // Transform position data to match the previous interface if needed
  const troveData = position ? {
    collateral: position.collateralAmount,
    debt: position.borrowedAmount,
    annualInterestRate: BigInt(Math.floor(position.interestRate * 1e16)), // Convert back to the expected format
    troveId: BigInt(troveId?.split(':')[1] || '0'), // Extract hex part after colon
    lastInterestRateAdjTime: BigInt(0), // This field is not available in Position
  } : null;

  return {
    troveData,
    position, // Also return the full position data
    isLoading,
    error,
    refetch,
  };
}