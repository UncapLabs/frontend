import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";

export function useFetchPrices(collateralAmount: number | undefined) {
  const trpc = useTRPC();
  const shouldFetchPrices = collateralAmount !== undefined && collateralAmount > 0;

  const bitcoinQuery = useQuery({
    ...trpc.priceRouter.getBitcoinPrice.queryOptions(),
    enabled: shouldFetchPrices,
    refetchInterval: shouldFetchPrices ? 30000 : false,
  });

  const bitUSDQuery = useQuery({
    ...trpc.priceRouter.getBitUSDPrice.queryOptions(),
    enabled: shouldFetchPrices,
    refetchInterval: shouldFetchPrices ? 30000 : false,
  });

  return {
    bitcoin: bitcoinQuery.data,
    bitUSD: bitUSDQuery.data,
    isLoading: bitcoinQuery.isLoading || bitUSDQuery.isLoading,
    refetchBitcoin: bitcoinQuery.refetch,
    refetchBitUSD: bitUSDQuery.refetch,
  };
}