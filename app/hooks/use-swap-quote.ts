import { useQuery } from "@tanstack/react-query";
import { type AvnuQuote, fetchAvnuQuote } from "~/lib/contracts/avnu";

export type OutputToken = "USDU" | "USDC";

interface UseSwapQuoteParams {
  usduAmount?: bigint;
  outputToken: OutputToken;
  enabled?: boolean;
}

interface SwapQuoteResult {
  quote: AvnuQuote | null;
  expectedUsdcAmount: bigint | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetches swap quotes from Avnu for USDU to USDC swaps
 * Uses direct fetch to avoid SDK schema validation issues with null price fields on Sepolia
 */
export function useSwapQuote({
  usduAmount,
  outputToken,
  enabled = true,
}: UseSwapQuoteParams): SwapQuoteResult {
  const shouldFetch =
    enabled &&
    outputToken === "USDC" &&
    usduAmount !== undefined &&
    usduAmount > 0n;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["avnu-swap-quote", usduAmount?.toString(), outputToken],
    queryFn: async () => {
      if (!usduAmount) return null;
      return fetchAvnuQuote(usduAmount);
    },
    enabled: shouldFetch,
    refetchInterval: 10000,
    staleTime: 5000,
  });

  return {
    quote: data ?? null,
    expectedUsdcAmount: data?.buyAmount ?? null,
    isLoading: shouldFetch && isLoading,
    error: error as Error | null,
    refetch,
  };
}
