import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import { DEFAULT_COLLATERAL, type CollateralId } from "~/lib/collateral";

interface UseFetchPricesOptions {
  collateralType?: CollateralId;
  fetchBitcoin?: boolean;
  fetchUsdu?: boolean;
  enabled?: boolean;
}

/**
 * Hook to fetch Bitcoin and/or USDU prices
 * @param options - Configuration options for which prices to fetch
 * @param options.collateralType - The type of collateral (UBTC, GBTC, WMWBTC)
 * @param options.fetchBitcoin - Whether to fetch Bitcoin price, defaults to true
 * @param options.fetchUsdu - Whether to fetch USDU price, defaults to true
 * @param options.enabled - Whether to enable the queries, defaults to true
 */
export function useFetchPrices(options: UseFetchPricesOptions = {}) {
  const {
    collateralType = DEFAULT_COLLATERAL.id,
    fetchBitcoin = true,
    fetchUsdu = true,
    enabled = true,
  } = options;

  const trpc = useTRPC();

  const bitcoinQuery = useQuery({
    ...trpc.priceRouter.getBitcoinPrice.queryOptions({ collateralType }),
    enabled: enabled && fetchBitcoin,
    refetchInterval: enabled && fetchBitcoin ? 30000 : false,
    staleTime: 10000,
  });

  const usduQuery = useQuery({
    ...trpc.priceRouter.getUSDUPrice.queryOptions(),
    enabled: enabled && fetchUsdu,
    refetchInterval: enabled && fetchUsdu ? 30000 : false,
    staleTime: 10000,
  });

  return {
    bitcoin: bitcoinQuery.data,
    usdu: usduQuery.data,
    isLoading:
      (fetchBitcoin && bitcoinQuery.isLoading) ||
      (fetchUsdu && usduQuery.isLoading),
    refetchBitcoin: bitcoinQuery.refetch,
    refetchUsdu: usduQuery.refetch,
  };
}
