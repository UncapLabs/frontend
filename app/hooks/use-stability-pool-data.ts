import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import { type CollateralType } from "~/lib/contracts/constants";

export interface StabilityPoolDataQuery {
  totalDeposits: number | undefined;
  apr: number | undefined;
  isLoading: boolean;
}

export interface UseStabilityPoolDataResult {
  UBTC: StabilityPoolDataQuery;
  GBTC: StabilityPoolDataQuery;
}

export function useStabilityPoolData(): UseStabilityPoolDataResult {
  const trpc = useTRPC();

  const ubtcTotalDepositsQuery = useQuery({
    ...trpc.stabilityPoolRouter.getTotalDeposits.queryOptions({
      collateralType: "UBTC",
    }),
    refetchInterval: 30000,
  });

  const gbtcTotalDepositsQuery = useQuery({
    ...trpc.stabilityPoolRouter.getTotalDeposits.queryOptions({
      collateralType: "GBTC",
    }),
    refetchInterval: 30000,
  });

  const ubtcAprQuery = useQuery({
    ...trpc.stabilityPoolRouter.getPoolApr.queryOptions({
      collateralType: "UBTC",
    }),
    refetchInterval: 30000,
  });

  const gbtcAprQuery = useQuery({
    ...trpc.stabilityPoolRouter.getPoolApr.queryOptions({
      collateralType: "GBTC",
    }),
    refetchInterval: 30000,
  });

  return {
    UBTC: {
      totalDeposits: ubtcTotalDepositsQuery.data,
      apr: ubtcAprQuery.data,
      isLoading: ubtcTotalDepositsQuery.isLoading || ubtcAprQuery.isLoading,
    },
    GBTC: {
      totalDeposits: gbtcTotalDepositsQuery.data,
      apr: gbtcAprQuery.data,
      isLoading: gbtcTotalDepositsQuery.isLoading || gbtcAprQuery.isLoading,
    },
  };
}

export function useStabilityPoolDataByType(
  collateralType: CollateralType
): StabilityPoolDataQuery {
  const data = useStabilityPoolData();
  return data[collateralType];
}