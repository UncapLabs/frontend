import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";

/**
 * Hook to fetch Uncap incentive rates from the Starknet API
 * Returns borrowRate (interest rebate, e.g., 0.4 = 40%) and supplyRate (collateral rebate, e.g., 0.02 = 2%)
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
