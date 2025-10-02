import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import { type CollateralId } from "~/lib/collateral";
import Big from "big.js";

export interface StabilityPoolDataQuery {
  totalDeposits: Big | undefined;
  apr: number | undefined;
  isLoading: boolean;
}

export interface UseStabilityPoolDataResult {
  UBTC: StabilityPoolDataQuery;
  GBTC: StabilityPoolDataQuery;
  WMWBTC: StabilityPoolDataQuery;
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

  const wmwbtcTotalDepositsQuery = useQuery({
    ...trpc.stabilityPoolRouter.getTotalDeposits.queryOptions({
      collateralType: "WMWBTC",
    }),
    refetchInterval: 30000,
  });

  const wmwbtcAprQuery = useQuery({
    ...trpc.stabilityPoolRouter.getPoolApr.queryOptions({
      collateralType: "WMWBTC",
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
    WMWBTC: {
      totalDeposits: wmwbtcTotalDepositsQuery.data,
      apr: wmwbtcAprQuery.data,
      isLoading: wmwbtcTotalDepositsQuery.isLoading || wmwbtcAprQuery.isLoading,
    },
  };
}

export function useStabilityPoolDataByType(
  collateralType: CollateralId
): StabilityPoolDataQuery {
  const data = useStabilityPoolData();
  return data[collateralType];
}