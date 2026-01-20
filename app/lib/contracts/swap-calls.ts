import type { Call } from "starknet";
import { type AvnuQuote, AVNU_BASE_URL, fetchAvnuQuote } from "./avnu";

const SLIPPAGE = 0.002; // 0.2% slippage for stablecoin pair

interface SwapCallsResult {
  calls: Call[];
  expectedUsdcAmount: bigint;
}

interface AvnuBuildResponse {
  chainId: string;
  calls: Call[];
}

/**
 * Builds the calls needed to swap USDU to USDC via Avnu
 * Returns the approve + swap calls ready to be included in a multicall
 */
export async function buildSwapCalls(
  quote: AvnuQuote,
  takerAddress: string
): Promise<SwapCallsResult> {
  const response = await fetch(`${AVNU_BASE_URL}/swap/v3/build`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteId: quote.quoteId,
      takerAddress,
      slippage: SLIPPAGE,
      includeApprove: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Avnu build API error: ${response.status}`);
  }

  const result: AvnuBuildResponse = await response.json();

  return {
    calls: result.calls,
    expectedUsdcAmount: quote.buyAmount,
  };
}

/**
 * Fetches a fresh quote and builds swap calls in one operation
 * Useful when you need both the quote and the calls
 */
export async function fetchQuoteAndBuildSwapCalls(
  usduAmount: bigint,
  takerAddress: string
): Promise<SwapCallsResult> {
  const quote = await fetchAvnuQuote(usduAmount);
  return buildSwapCalls(quote, takerAddress);
}
