import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import { 
  UBTC_TOKEN, 
  GBTC_TOKEN,
  type CollateralType 
} from "~/lib/contracts/constants";

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
    UBTC: {
      formatted: query.data?.UBTC ?? 0,
      symbol: UBTC_TOKEN.symbol,
      hasAmount: (query.data?.UBTC ?? 0) > 0,
      collateralType: "UBTC" as CollateralType,
    },
    GBTC: {
      formatted: query.data?.GBTC ?? 0,
      symbol: GBTC_TOKEN.symbol,
      hasAmount: (query.data?.GBTC ?? 0) > 0,
      collateralType: "GBTC" as CollateralType,
    },
  };

  const availableSurpluses = [formattedSurpluses.UBTC, formattedSurpluses.GBTC]
    .filter(s => s.hasAmount);

  return {
    surpluses: formattedSurpluses,
    availableSurpluses,
    totalSurplusesCount: availableSurpluses.length,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}