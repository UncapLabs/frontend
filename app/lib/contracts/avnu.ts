/**
 * Avnu API types and constants
 * Direct API integration without SDK to avoid schema validation issues
 */

import { TOKENS } from "~/lib/collateral";

const isMainnet = import.meta.env.VITE_CHAIN_ID === "SN_MAIN";

export const AVNU_BASE_URL = isMainnet
  ? "https://starknet.api.avnu.fi"
  : "https://sepolia.api.avnu.fi";

/**
 * Slippage configuration per token pair
 * Higher slippage for volatile pairs, lower for stablecoin pairs
 */
export const SWAP_SLIPPAGE: Record<string, number> = {
  "USDU-USDC": 0.002, // 0.2% - stablecoin pair
  "STRK-USDU": 0.015, // 1.5% - volatile to stable
  "STRK-WBTC": 0.02, // 2.0% - volatile to volatile
  "WBTC-USDU": 0.01, // 1.0% - collateral to stable
  "TBTC-USDU": 0.01, // 1.0% - collateral to stable
  "SOLVBTC-USDU": 0.01, // 1.0% - collateral to stable
  DEFAULT: 0.02, // 2% default for unknown pairs
};

/**
 * Get slippage for a token pair
 */
export function getSlippageForPair(
  sellSymbol: string,
  buySymbol: string
): number {
  const pairKey = `${sellSymbol}-${buySymbol}`;
  return SWAP_SLIPPAGE[pairKey] ?? SWAP_SLIPPAGE.DEFAULT;
}

export interface AvnuQuote {
  quoteId: string;
  sellTokenAddress: string;
  sellAmount: bigint;
  buyTokenAddress: string;
  buyAmount: bigint;
  routes: AvnuRoute[];
  chainId: string;
  blockNumber?: string;
  expiry?: number | null;
}

export interface AvnuRoute {
  name: string;
  address: string;
  percent: number;
  sellTokenAddress: string;
  buyTokenAddress: string;
}

export interface FetchAvnuQuoteParams {
  sellTokenAddress: string;
  buyTokenAddress: string;
  sellAmount: bigint;
}

/**
 * Fetches a swap quote from Avnu for any token pair
 * Handles the API response parsing and bigint conversion
 */
export async function fetchAvnuQuote(
  params: FetchAvnuQuoteParams
): Promise<AvnuQuote> {
  const sellAmountHex = "0x" + params.sellAmount.toString(16);

  const urlParams = new URLSearchParams({
    sellTokenAddress: params.sellTokenAddress,
    buyTokenAddress: params.buyTokenAddress,
    sellAmount: sellAmountHex,
  });

  const response = await fetch(
    `${AVNU_BASE_URL}/swap/v3/quotes?${urlParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Avnu API error: ${response.status}`);
  }

  const quotes: AvnuQuote[] = await response.json();

  if (!quotes || quotes.length === 0) {
    throw new Error("No swap routes available");
  }

  const rawQuote = quotes[0];

  return {
    ...rawQuote,
    sellAmount: BigInt(rawQuote.sellAmount),
    buyAmount: BigInt(rawQuote.buyAmount),
  };
}
