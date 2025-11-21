import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import { COLLATERAL_LIST, type CollateralId } from "~/lib/collateral";
import Big from "big.js";

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

  // Create queries dynamically for all collaterals
  const depositQueries = COLLATERAL_LIST.map((collateral) =>
    useQuery({
      ...trpc.stabilityPoolRouter.getTotalDeposits.queryOptions({
        collateralType: collateral.id,
      }),
      refetchInterval: 30000,
    })
  );

  const aprQueries = COLLATERAL_LIST.map((collateral) =>
    useQuery({
      ...trpc.stabilityPoolRouter.getPoolApr.queryOptions({
        collateralType: collateral.id,
      }),
      refetchInterval: 30000,
    })
  );

  // Build result object dynamically
  const result = {} as Record<CollateralId, StabilityPoolDataQuery>;

  COLLATERAL_LIST.forEach((collateral, index) => {
    result[collateral.id] = {
      totalDeposits: depositQueries[index].data,
      apr: aprQueries[index].data,
      isLoading: depositQueries[index].isLoading || aprQueries[index].isLoading,
    };
  });

  return result;
}
