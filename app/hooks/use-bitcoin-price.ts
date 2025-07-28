import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";

export function useBitcoinPrice() {
  const trpc = useTRPC();

  const { data, isLoading, error } = useQuery({
    ...trpc.priceRouter.getBitcoinPrice.queryOptions(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return {
    price: data?.price,
    isLoading,
    error,
  };
}
