import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import type { CollateralType } from "~/lib/contracts/constants";

export function useBitcoinPrice(collateralType: CollateralType = "UBTC") {
  const trpc = useTRPC();

  const { data, isLoading, error } = useQuery({
    ...trpc.priceRouter.getBitcoinPrice.queryOptions({ collateralType }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return {
    price: data?.price,
    isLoading,
    error,
  };
}
