/**
 * Avnu API types and constants
 * Direct API integration without SDK to avoid schema validation issues
 */

import { TOKENS } from "~/lib/collateral";

const isMainnet = import.meta.env.VITE_CHAIN_ID === "SN_MAIN";

export const AVNU_BASE_URL = isMainnet
  ? "https://starknet.api.avnu.fi"
  : "https://sepolia.api.avnu.fi";

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

/**
 * Fetches a swap quote from Avnu for USDU to USDC
 * Handles the API response parsing and bigint conversion
 */
export async function fetchAvnuQuote(usduAmount: bigint): Promise<AvnuQuote> {
  const sellAmountHex = "0x" + usduAmount.toString(16);

  const params = new URLSearchParams({
    sellTokenAddress: TOKENS.USDU.address,
    buyTokenAddress: TOKENS.USDC.address,
    sellAmount: sellAmountHex,
  });

  const response = await fetch(
    `${AVNU_BASE_URL}/swap/v3/quotes?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Avnu API error: ${response.status}`);
  }

  const quotes: AvnuQuote[] = await response.json();

  if (!quotes || quotes.length === 0) {
    throw new Error("No swap routes available for USDU to USDC");
  }

  const rawQuote = quotes[0];

  return {
    ...rawQuote,
    sellAmount: BigInt(rawQuote.sellAmount),
    buyAmount: BigInt(rawQuote.buyAmount),
  };
}
