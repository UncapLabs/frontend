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

// Map API asset symbols to our collateral IDs
const ASSET_SYMBOL_MAP: Record<string, string> = {
  WBTC: "WWBTC",
  TBTC: "TBTC",
  SOLVBTC: "SOLVBTC",
};

// Default supply rates per asset (fallback if API doesn't have data)
const DEFAULT_SUPPLY_RATES: Record<string, number> = {
  WWBTC: 0.02, // 2%
  TBTC: 0.02, // 2%
  SOLVBTC: 0.02, // 2%
};

/**
 * Get network-prefixed cache key to prevent staging/production data mixing
 */
function getCacheKey(base: string): string {
  const network = process.env.NETWORK || "sepolia";
  return `${network}:${base}`;
}

export interface IncentiveRates {
  borrowRate: number;
  supplyRates: Record<string, number>; // Per-asset supply rates keyed by collateral ID (WWBTC, TBTC, SOLVBTC)
  maxDailyTokens: number;
}

/**
 * Fetches Uncap protocol incentive rates from SNF API
 * Returns the interest rebate rate (borrow side) and per-asset collateral rebate rates (supply side)
 */
export async function getUncapIncentiveRates(env: Env): Promise<IncentiveRates> {
  const cacheKey = getCacheKey("uncap-incentive-rates-v2");

  // Try to get from KV store first
  const cached = await env.CACHE.get(cacheKey, "json");
  if (cached) {
    return cached as IncentiveRates;
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

  // Find all Uncap lending entries and build per-asset supply rates
  const uncapLendingEntries = lendingData.items.filter(
    (item) => item.protocol === PROTOCOL
  );

  // Build supply rates map from API data
  const supplyRates: Record<string, number> = { ...DEFAULT_SUPPLY_RATES };
  for (const entry of uncapLendingEntries) {
    const collateralId = ASSET_SYMBOL_MAP[entry.asset_symbol];
    if (collateralId) {
      supplyRates[collateralId] = parseFloat(entry.effective_apr);
    }
  }

  // Find the borrowing entry for rebate rate
  const borrowingEntry = borrowingData.items.find(
    (item) => item.protocol === PROTOCOL
  );

  if (!borrowingEntry) {
    throw new Error(
      "Could not find Uncap protocol data in borrowing API response"
    );
  }

  const result: IncentiveRates = {
    borrowRate: parseFloat(borrowingEntry.rebate_rate), // e.g., 0.4 = 40% rebate
    supplyRates, // Per-asset rates
    maxDailyTokens: 0, // No longer used
  };

  // Cache the result in KV store with TTL
  await env.CACHE.put(cacheKey, JSON.stringify(result), {
    expirationTtl: CACHE_TTL,
  });

  return result;
}
