import type { Call } from "starknet";
import { type AvnuQuote, AVNU_BASE_URL, getSlippageForPair } from "./avnu";

export interface SwapCallsResult {
  calls: Call[];
  expectedOutputAmount: bigint;
}

interface AvnuBuildResponse {
  chainId: string;
  calls: Call[];
}

export interface BuildSwapCallsParams {
  quote: AvnuQuote;
  takerAddress: string;
  /** Token symbols for automatic slippage lookup */
  sellSymbol: string;
  buySymbol: string;
}

/**
 * Builds the calls needed to swap tokens via Avnu
 * Returns the approve + swap calls ready to be included in a multicall
 * Slippage is automatically determined based on the token pair
 */
export async function buildSwapCalls({
  quote,
  takerAddress,
  sellSymbol,
  buySymbol,
}: BuildSwapCallsParams): Promise<SwapCallsResult> {
  const slippage = getSlippageForPair(sellSymbol, buySymbol);

  const response = await fetch(`${AVNU_BASE_URL}/swap/v3/build`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteId: quote.quoteId,
      takerAddress,
      slippage,
      includeApprove: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Avnu build API error: ${response.status}`);
  }

  const result: AvnuBuildResponse = await response.json();

  return {
    calls: result.calls,
    expectedOutputAmount: quote.buyAmount,
  };
}
