import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import type { CollateralId } from "~/lib/collateral";

/**
 * Hook to fetch Uncap incentive rates from the Starknet API
 * Returns borrowRate (interest rebate, e.g., 0.4 = 40%) and supplyRates (per-asset collateral rebate)
 * Data is cached for 30 minutes and refreshed every 30 minutes
 */
export function useUncapIncentiveRates() {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.incentivesRouter.getUncapRates.queryOptions(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Helper to get supply rate for a specific collateral
 * Falls back to 2% if rate is not available
 */
export function getSupplyRateForCollateral(
  supplyRates: Record<string, number> | undefined,
  collateralId: CollateralId
): number {
  return supplyRates?.[collateralId] ?? 0.02;
}
