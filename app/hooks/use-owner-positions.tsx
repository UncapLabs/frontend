import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "@starknet-react/core";
import { type CollateralType } from "~/lib/contracts/constants";
import { useTRPC } from "~/lib/trpc";

interface UseOwnerPositionsOptions {
  refetchInterval?: number;
  enabled?: boolean;
  collateralType?: CollateralType;
}

export function useOwnerPositions(options: UseOwnerPositionsOptions = {}) {
  const { enabled = true, collateralType = "UBTC" } = options;
  const { address } = useAccount();
  const trpc = useTRPC();

  const {
    data: positionsData,
    isLoading: isLoadingOwnerPositions,
    error,
  } = useQuery(
    trpc.positionsRouter.getUserOnChainPositions.queryOptions(
      {
        userAddress: address as `0x${string}`,
      },
      {
        enabled: !!address && enabled,
        refetchInterval: options.refetchInterval || 30000,
      }
    )
  );

  const ownerPositions = useMemo(() => {
    if (!positionsData?.positions) return null;

    // Filter by collateral type and map to trove IDs
    return positionsData.positions
      .filter((position) => {
        if (collateralType === "UBTC") {
          return position.collateralAsset === "UBTC";
        } else if (collateralType === "GBTC") {
          return position.collateralAsset === "GBTC";
        }
        return true;
      })
      .map((position) => BigInt(position.id));
  }, [positionsData, collateralType]);

  const ownerIndex = useMemo(() => {
    if (ownerPositions && Array.isArray(ownerPositions)) {
      return BigInt(ownerPositions.length);
    }
    // Default to 0n if positions are not yet loaded or an error occurred,
    // For opening a new trove, if this is the *first* for the owner, length 0 is correct.
    return 0n;
  }, [ownerPositions]);

  return {
    ownerPositions,
    ownerIndex,
    isLoadingOwnerPositions,
    error,
  };
}
