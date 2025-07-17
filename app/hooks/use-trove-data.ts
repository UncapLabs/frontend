import { useQuery } from "@tanstack/react-query";
import { useContract } from "@starknet-react/core";
import {
  TROVE_MANAGER_ADDRESS,
  TBTC_DECIMALS,
  USDU_DECIMALS,
} from "~/lib/contracts/constants";
import { TROVE_MANAGER_ABI } from "~/lib/contracts";

interface TroveData {
  collateral: number;
  debt: number;
  annualInterestRate: bigint;
  troveId: bigint;
  lastInterestRateAdjTime: bigint;
}

export function useTroveData(troveId?: string) {
  const { contract: troveManagerContract } = useContract({
    abi: TROVE_MANAGER_ABI,
    address: TROVE_MANAGER_ADDRESS,
  });

  const {
    data: troveData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["troveData", troveId, TROVE_MANAGER_ADDRESS],
    queryFn: async () => {
      if (!troveManagerContract || !troveId) return null;

      try {
        const troveIdBigInt = BigInt(troveId);
        const latestData = await troveManagerContract.get_latest_trove_data(
          troveIdBigInt
        );

        if (!latestData || typeof latestData.entire_coll === "undefined") {
          return null;
        }

        return {
          collateral:
            Number(latestData.entire_coll) / Math.pow(10, TBTC_DECIMALS),
          debt: Number(latestData.entire_debt) / Math.pow(10, USDU_DECIMALS),
          annualInterestRate: latestData.annual_interest_rate as bigint,
          troveId: troveIdBigInt,
          lastInterestRateAdjTime: latestData.last_interest_rate_adj_time as bigint,
        } as TroveData;
      } catch (e) {
        console.error("Error fetching trove data:", e);
        return null;
      }
    },
    enabled: !!troveManagerContract && !!troveId,
    refetchInterval: 30000,
  });

  return {
    troveData,
    isLoading,
    error,
    refetch,
  };
}
