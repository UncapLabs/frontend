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

  return {
    position,
    isLoading,
    error,
    refetch,
  };
}