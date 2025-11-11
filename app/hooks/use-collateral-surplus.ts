import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import { COLLATERALS, type CollateralId } from "~/lib/collateral";
import Big from "big.js";

/**
 * Hook to read collateral surplus for a borrower across all collateral types
 * Uses TanStack Query and tRPC for efficient data fetching and caching
 */
export function useCollateralSurplus(borrower: string | undefined) {
  const trpc = useTRPC();

  const query = useQuery({
    ...trpc.positionsRouter.getCollateralSurplus.queryOptions(
      { borrower: borrower! },
      { enabled: !!borrower }
    ),
  });

  // Convert to readable format
  const formattedSurpluses = {
    // WXLBTC: {
    //   formatted: query.data?.WXLBTC ?? Big(0),
    //   symbol: COLLATERALS.WXLBTC.symbol,
    //   hasAmount: query.data?.WXLBTC ? query.data.WXLBTC.gt(0) : false,
    //   collateralType: "WXLBTC" as CollateralId,
    // },
    WWBTC: {
      formatted: query.data?.WWBTC ?? Big(0),
      symbol: COLLATERALS.WWBTC.symbol,
      hasAmount: query.data?.WWBTC ? query.data.WWBTC.gt(0) : false,
      collateralType: "WWBTC" as CollateralId,
    },
  };

  const availableSurpluses = [
    // formattedSurpluses.WXLBTC,
    formattedSurpluses.WWBTC,
  ].filter((s) => s.hasAmount);

  return {
    surpluses: formattedSurpluses,
    availableSurpluses,
    totalSurplusesCount: availableSurpluses.length,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
