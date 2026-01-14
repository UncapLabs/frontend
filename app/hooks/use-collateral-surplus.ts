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
    WWBTC: {
      formatted: query.data?.WWBTC ?? Big(0),
      symbol: COLLATERALS.WWBTC.symbol,
      hasAmount: query.data?.WWBTC ? query.data.WWBTC.gt(0) : false,
      collateralType: "WWBTC" as CollateralId,
    },
    TBTC: {
      formatted: query.data?.TBTC ?? Big(0),
      symbol: COLLATERALS.TBTC.symbol,
      hasAmount: query.data?.TBTC ? query.data.TBTC.gt(0) : false,
      collateralType: "TBTC" as CollateralId,
    },
    SOLVBTC: {
      formatted: query.data?.SOLVBTC ?? Big(0),
      symbol: COLLATERALS.SOLVBTC.symbol,
      hasAmount: query.data?.SOLVBTC ? query.data.SOLVBTC.gt(0) : false,
      collateralType: "SOLVBTC" as CollateralId,
    },
  };

  const availableSurpluses = [
    formattedSurpluses.WWBTC,
    formattedSurpluses.TBTC,
    formattedSurpluses.SOLVBTC,
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
