import { useQuery } from "@tanstack/react-query";
import { type AvnuQuote, fetchAvnuQuote } from "~/lib/contracts/avnu";
import type { Token } from "~/lib/collateral";

export interface UseSwapQuoteParams {
  sellToken: Token;
  buyToken: Token;
  sellAmount?: bigint;
  enabled?: boolean;
}

export interface SwapQuoteResult {
  quote: AvnuQuote | null;
  expectedOutputAmount: bigint | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetches swap quotes from Avnu for any token pair
 * Refreshes every 10 seconds when enabled
 */
export function useSwapQuote({
  sellToken,
  buyToken,
  sellAmount,
  enabled = true,
}: UseSwapQuoteParams): SwapQuoteResult {
  const shouldFetch =
    enabled &&
    sellAmount !== undefined &&
    sellAmount > 0n &&
    sellToken.address !== buyToken.address;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      "avnu-swap-quote",
      sellToken.symbol,
      buyToken.symbol,
      sellAmount?.toString(),
    ],
    queryFn: async () => {
      if (!sellAmount) return null;
      return fetchAvnuQuote({
        sellTokenAddress: sellToken.address,
        buyTokenAddress: buyToken.address,
        sellAmount,
      });
    },
    enabled: shouldFetch,
    refetchInterval: 10000,
    staleTime: 5000,
  });

  return {
    quote: data ?? null,
    expectedOutputAmount: data?.buyAmount ?? null,
    isLoading: shouldFetch && isLoading,
    error: error as Error | null,
    refetch,
  };
}
