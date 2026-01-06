/**
 * Service for fetching Starknet lending incentives data
 * API: Starknet Foundation (SNF) BTCFi Season APIs
 */

interface SNFLendingItem {
  date: string;
  protocol: string;
  market_address: string;
  market_name: string;
  asset_symbol: string;
  total_supply_tokens: string;
  total_supply_usd: string;
  total_borrow_tokens: string;
  total_borrow_usd: string;
  incentive_usd: string;
  allocated_tokens: string;
  effective_apr: string;
}

const SNF_API_BASE_URL =
  "https://5xyjxn0qoe.execute-api.eu-west-1.amazonaws.com/prod";
const PROTOCOL = "Uncap";
const CACHE_TTL = 30 * 60 * 12; // 12 hours

// Hardcoded rebate rate (40%) - update if SNF changes this
const BORROW_REBATE_RATE = 0.4;

/**
 * Get network-prefixed cache key to prevent staging/production data mixing
 */
function getCacheKey(base: string): string {
  const network = process.env.NETWORK || "sepolia";
  return `${network}:${base}`;
}

/**
 * Fetches Uncap protocol incentive rates from SNF API
 * Returns the interest rebate rate (borrow side) and collateral rebate rate (supply side)
 */
export async function getUncapIncentiveRates(
  env: Env
): Promise<{ borrowRate: number; supplyRate: number; maxDailyTokens: number }> {
  const cacheKey = getCacheKey("uncap-incentive-rates");

  // Try to get from KV store first
  const cached = await env.CACHE.get(cacheKey, "json");
  if (cached) {
    return cached as {
      borrowRate: number;
      supplyRate: number;
      maxDailyTokens: number;
    };
  }

  // Fetch from SNF mm-lending API
  const url = `${SNF_API_BASE_URL}/mm-lending`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch incentive rates: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as SNFLendingItem[];

  // Find the most recent Uncap entry (API returns data sorted by date desc)
  const uncapEntry = data.find((item) => item.protocol === PROTOCOL);

  if (!uncapEntry) {
    throw new Error("Could not find Uncap protocol data in API response");
  }

  const result = {
    borrowRate: BORROW_REBATE_RATE, // Hardcoded 40% rebate rate
    supplyRate: parseFloat(uncapEntry.effective_apr), // e.g., 0.02 = 2%
    maxDailyTokens: 0, // No longer used
  };

  // Cache the result in KV store with TTL
  await env.CACHE.put(cacheKey, JSON.stringify(result), {
    expirationTtl: CACHE_TTL,
  });

  return result;
}
