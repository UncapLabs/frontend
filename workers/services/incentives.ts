/**
 * Service for fetching Starknet lending incentives data
 * API Documentation: https://www.data-openblocklabs.com
 */

interface LendingIncentiveItem {
  date: string;
  protocol: string;
  user_address: string;
  token_symbol: string;
  token_address: string;
  incentivized_side: "borrow" | "supply";
  borrowed_token_symbol: string;
  borrowed_token_address: string;
  rate: number;
  max_daily_incentive_tokens: number | null;
  market_address: string;
  market_name: string;
  asset: string;
  asset_symbol: string;
  asset_decimals: number;
  debt_asset: string;
  debt_asset_symbol: string;
  debt_decimals: number;
  total_supply_tokens: number;
  total_borrow_tokens: number;
  total_supply_usd: number;
  total_borrow_usd: number;
  interest_tokens_daily: number | null;
  interest_usd_daily: number | null;
  incentive_usd: number | null;
  allocated_tokens_raw: number | null;
  allocated_tokens: number | null;
  effective_apr: number | null;
}

interface LendingIncentivesResponse {
  items: LendingIncentiveItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

const API_BASE_URL = "https://www.data-openblocklabs.com";
const CACHE_TTL = 30 * 60; // 30 minutes (API caches for 30 mins)

/**
 * Fetches Uncap protocol incentive rates from the Starknet API
 * Returns the interest rebate rate (borrow side) and collateral rebate rate (supply side)
 */
export async function getUncapIncentiveRates(
  env: Env
): Promise<{ borrowRate: number; supplyRate: number; maxDailyTokens: number }> {
  const cacheKey = "uncap-incentive-rates";

  // Try to get from KV store first
  const cached = await env.CACHE.get(cacheKey, "json");
  if (cached) {
    return cached as {
      borrowRate: number;
      supplyRate: number;
      maxDailyTokens: number;
    };
  }

  // Fetch from API - only need a small sample to get the rates
  const url = `${API_BASE_URL}/starknet/lending-incentives/Uncap/all?page=1&size=10`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch incentive rates: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as LendingIncentivesResponse;

  console.log("data", data);

  // Extract rates from the response
  // Find first entry for each incentivized side
  const borrowEntry = data.items.find(
    (item) => item.incentivized_side === "borrow"
  );
  const supplyEntry = data.items.find(
    (item) => item.incentivized_side === "supply"
  );

  if (!borrowEntry || !supplyEntry) {
    throw new Error("Could not find borrow or supply rates in API response");
  }

  const result = {
    borrowRate: borrowEntry.rate, // e.g., 0.4 = 40%
    supplyRate: supplyEntry.rate, // e.g., 0.02 = 2%
    maxDailyTokens: borrowEntry.max_daily_incentive_tokens || 0,
  };

  // Cache the result in KV store with TTL
  await env.CACHE.put(cacheKey, JSON.stringify(result), {
    expirationTtl: CACHE_TTL,
  });

  return result;
}
