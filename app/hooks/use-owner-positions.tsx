import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useContract } from "@starknet-react/core";
import { TROVE_MANAGER_ADDRESS } from "~/lib/contracts/constants";
import { TROVE_MANAGER_ABI } from "~/lib/contracts";

interface UseOwnerPositionsOptions {
  refetchInterval?: number;
  enabled?: boolean;
}

export function useOwnerPositions(options: UseOwnerPositionsOptions = {}) {
  const { enabled = true } = options;
  const { address } = useAccount();

  const { contract: troveManagerContract } = useContract({
    abi: TROVE_MANAGER_ABI,
    address: TROVE_MANAGER_ADDRESS,
  });

  const {
    data: ownerPositions,
    isLoading: isLoadingOwnerPositions,
    error,
  } = useQuery({
    queryKey: ["ownerPositions", address, TROVE_MANAGER_ADDRESS],
    queryFn: async () => {
      if (!troveManagerContract || !address) return null;
      try {
        const positions = await troveManagerContract.get_owner_to_positions(
          address
        );
        return positions as bigint[];
      } catch (e) {
        console.error("Error fetching owner positions:", e);
        return null;
      }
    },
    enabled: !!troveManagerContract && !!address && enabled,
    refetchInterval: 30000,
    // ...(options.refetchInterval && {
    //   refetchInterval: options.refetchInterval,
    // }),
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
