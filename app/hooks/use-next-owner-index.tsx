import { useQuery } from "@tanstack/react-query";
import { type CollateralType } from "~/lib/contracts/constants";
import { useTRPC } from "~/lib/trpc";

interface UseNextOwnerIndexOptions {
  address: string | undefined;
  collateralType?: CollateralType;
  enabled?: boolean;
}

export function useNextOwnerIndex(options: UseNextOwnerIndexOptions) {
  const { address, collateralType = "UBTC", enabled = true } = options;
  const trpc = useTRPC();

  const {
    data: nextOwnerIndexData,
    isLoading: isLoadingNextOwnerIndex,
    error: nextOwnerIndexError,
  } = useQuery(
    trpc.positionsRouter.getNextOwnerIndex.queryOptions(
      {
        borrower: address as string,
        collateralType,
      },
      {
        enabled: !!address && enabled,
      }
    )
  );

  return {
    nextOwnerIndex:
      nextOwnerIndexData?.nextOwnerIndex !== undefined
        ? BigInt(nextOwnerIndexData.nextOwnerIndex)
        : 0n,
    isLoading: isLoadingNextOwnerIndex,
    error: nextOwnerIndexError,
  };
}
