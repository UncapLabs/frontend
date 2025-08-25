import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import type { CollateralType } from "~/lib/contracts/constants";

export function useFetchPrices(
  collateralAmount: number | undefined,
  collateralType: CollateralType = "UBTC"
) {
  const trpc = useTRPC();
  const shouldFetchPrices =
    collateralAmount !== undefined && collateralAmount > 0;

  const bitcoinQuery = useQuery({
    ...trpc.priceRouter.getBitcoinPrice.queryOptions({ collateralType }),
    enabled: shouldFetchPrices,
    refetchInterval: shouldFetchPrices ? 30000 : false,
  });

  const usduQuery = useQuery({
    ...trpc.priceRouter.getUSDUPrice.queryOptions(),
    enabled: shouldFetchPrices,
    refetchInterval: shouldFetchPrices ? 30000 : false,
  });

  return {
    bitcoin: bitcoinQuery.data,
    usdu: usduQuery.data,
    isLoading: bitcoinQuery.isLoading || usduQuery.isLoading,
    refetchBitcoin: bitcoinQuery.refetch,
    refetchUsdu: usduQuery.refetch,
  };
}
