import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import type { CollateralId } from "~/lib/collateral";

export function useBranchTCR(collateralType: CollateralId) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.branchRouter.getTCR.queryOptions(
      { branchId: collateralType },
      {
        refetchInterval: 120000, // Refetch every 2 minutes
        staleTime: 120000, // Consider data stale after 2 minutes
      }
    ),
  });
}
