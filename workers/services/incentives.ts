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

interface SNFBorrowingItem {
  date: string;
  protocol: string;
  market_address: string;
  market_name: string;
  collateral_symbol: string | null;
  debt_asset_symbol: string;
  debt_asset: string;
  total_borrow_tokens: string;
  total_borrow_usd: string;
  total_supply_usd: string;
  interest_usd_daily: string;
  incentive_usd: string;
  allocated_tokens: string;
  effective_apr: string;
  rebate_rate: string;
}

interface SNFApiResponse<T> {
  items: T[];
}

const SNF_API_BASE_URL =
  "https://5xyjxn0qoe.execute-api.eu-west-1.amazonaws.com/prod";
const PROTOCOL = "Uncap";
const CACHE_TTL = 30 * 60 * 12; // 12 hours

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

  // Fetch from both SNF mm-lending and mm-borrowing APIs in parallel
  const [lendingResponse, borrowingResponse] = await Promise.all([
    fetch(`${SNF_API_BASE_URL}/mm-lending`),
    fetch(`${SNF_API_BASE_URL}/mm-borrowing`),
  ]);

  if (!lendingResponse.ok) {
    throw new Error(
      `Failed to fetch lending rates: ${lendingResponse.status} ${lendingResponse.statusText}`
    );
  }

  if (!borrowingResponse.ok) {
    throw new Error(
      `Failed to fetch borrowing rates: ${borrowingResponse.status} ${borrowingResponse.statusText}`
    );
  }

  const lendingData = (await lendingResponse.json()) as SNFApiResponse<SNFLendingItem>;
  const borrowingData = (await borrowingResponse.json()) as SNFApiResponse<SNFBorrowingItem>;

  // Find the most recent Uncap entries (API returns data sorted by date desc)
  const lendingEntry = lendingData.items.find((item) => item.protocol === PROTOCOL);
  const borrowingEntry = borrowingData.items.find((item) => item.protocol === PROTOCOL);

  if (!lendingEntry) {
    throw new Error("Could not find Uncap protocol data in lending API response");
  }

  if (!borrowingEntry) {
    throw new Error("Could not find Uncap protocol data in borrowing API response");
  }

  const result = {
    borrowRate: parseFloat(borrowingEntry.rebate_rate), // e.g., 0.4 = 40% rebate
    supplyRate: parseFloat(lendingEntry.effective_apr), // e.g., 0.02 = 2%
    maxDailyTokens: 0, // No longer used
  };

  // Cache the result in KV store with TTL
  await env.CACHE.put(cacheKey, JSON.stringify(result), {
    expirationTtl: CACHE_TTL,
  });

  return result;
}
