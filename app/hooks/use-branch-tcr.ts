import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import type { CollateralType } from "~/lib/contracts/constants";

export function useBranchTCR(collateralType: CollateralType) {
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
