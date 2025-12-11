import { useQueries } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import { COLLATERAL_LIST, type CollateralId } from "~/lib/collateral";
import Big from "big.js";
import { useMemo } from "react";

export interface StabilityPoolDataQuery {
  totalDeposits: Big | undefined;
  apr: number | undefined;
  isLoading: boolean;
}

export type UseStabilityPoolDataResult = Record<
  CollateralId,
  StabilityPoolDataQuery
>;

export function useStabilityPoolData(): UseStabilityPoolDataResult {
  const trpc = useTRPC();

  // Use useQueries to run multiple queries in parallel - this is the correct
  // way to dynamically create multiple queries without violating hooks rules
  const depositQueries = useQueries({
    queries: COLLATERAL_LIST.map((collateral) => ({
      ...trpc.stabilityPoolRouter.getTotalDeposits.queryOptions({
        collateralType: collateral.id,
      }),
      refetchInterval: 30000,
    })),
  });

  const aprQueries = useQueries({
    queries: COLLATERAL_LIST.map((collateral) => ({
      ...trpc.stabilityPoolRouter.getPoolApr.queryOptions({
        collateralType: collateral.id,
      }),
      refetchInterval: 30000,
    })),
  });

  // Memoize the result object to prevent unnecessary re-renders
  return useMemo(() => {
    const result = {} as Record<CollateralId, StabilityPoolDataQuery>;

    COLLATERAL_LIST.forEach((collateral, index) => {
      result[collateral.id] = {
        totalDeposits: depositQueries[index].data,
        apr: aprQueries[index].data,
        isLoading:
          depositQueries[index].isLoading || aprQueries[index].isLoading,
      };
    });

    return result;
  }, [depositQueries, aprQueries]);
}
