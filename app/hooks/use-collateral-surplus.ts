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

  // Convert to readable format with decimals
  const formattedSurpluses = {
    UBTC: {
      raw: BigInt(query.data?.UBTC?.raw ?? "0"), // Convert string back to BigInt
      formatted: query.data?.UBTC?.formatted ?? 0,
      symbol: UBTC_TOKEN.symbol,
      hasAmount: (query.data?.UBTC?.formatted ?? 0) > 0,
      collateralType: "UBTC" as CollateralType,
    },
    GBTC: {
      raw: BigInt(query.data?.GBTC?.raw ?? "0"), // Convert string back to BigInt
      formatted: query.data?.GBTC?.formatted ?? 0,
      symbol: GBTC_TOKEN.symbol,
      hasAmount: (query.data?.GBTC?.formatted ?? 0) > 0,
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