import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import Big from "big.js";

/**
 * Hook to fetch aggregated protocol stats (total collateral USD and USDU in circulation)
 * Data is cached server-side for 30 minutes
 */
export function useProtocolStats() {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.protocolStatsRouter.getStats.queryOptions(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
    select: (data) => ({
      totalCollateralUSD: new Big(data.totalCollateralUSD),
      totalUsduCirculation: new Big(data.totalUsduCirculation),
    }),
  });
}
