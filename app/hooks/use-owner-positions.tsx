import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "@starknet-react/core";
import { type CollateralType } from "~/lib/contracts/constants";
import { graphqlClient } from "~/lib/graphql/client";
import { GET_OWNER_POSITIONS } from "~/lib/graphql/documents";
import type { GetOwnerPositionsQuery } from "~/lib/graphql/gql/graphql";

interface UseOwnerPositionsOptions {
  refetchInterval?: number;
  enabled?: boolean;
  collateralType?: CollateralType;
}

export function useOwnerPositions(options: UseOwnerPositionsOptions = {}) {
  const { enabled = true, collateralType = "UBTC" } = options;
  const { address } = useAccount();

  const {
    data: ownerPositions,
    isLoading: isLoadingOwnerPositions,
    error,
  } = useQuery({
    queryKey: ["ownerPositions", address, collateralType],
    queryFn: async () => {
      if (!address) return null;
      try {
        const data = await graphqlClient.request<GetOwnerPositionsQuery>(
          GET_OWNER_POSITIONS,
          { owner: address }
        );
        
        // Filter troves by collateral type if needed
        const troves = data?.troves || [];
        return troves
          .filter((t) => {
            if (collateralType === "UBTC") {
              return t.collateral?.id === "0";
            } else if (collateralType === "GBTC") {
              return t.collateral?.id === "1";
            }
            return true;
          })
          .map((t) => BigInt(t.troveId));
      } catch (e) {
        console.error("Error fetching owner positions:", e);
        return null;
      }
    },
    enabled: !!address && enabled,
    refetchInterval: options.refetchInterval || 30000,
  });

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