import { useQuery } from "@tanstack/react-query";
import { DEFAULT_COLLATERAL, type CollateralId } from "~/lib/collateral";
import { useTRPC } from "~/lib/trpc";

interface UseNextOwnerIndexOptions {
  address: string | undefined;
  collateralType?: CollateralId;
  enabled?: boolean;
}

export function useNextOwnerIndex(options: UseNextOwnerIndexOptions) {
  const {
    address,
    collateralType = DEFAULT_COLLATERAL.id,
    enabled = true,
  } = options;
  const trpc = useTRPC();

  const {
    data: nextOwnerIndexData,
    isLoading: isLoadingNextOwnerIndex,
    error: nextOwnerIndexError,
  } = useQuery(
    trpc.positionsRouter.getNextOwnerIndex.queryOptions(
      {
        borrower: address as string,
        collateralType: collateralType,
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
