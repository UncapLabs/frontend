import { Contract, RpcProvider } from "starknet";
import { PRICE_FEED_ABI } from "~/lib/contracts";
import { getCollateral, type CollateralId } from "~/lib/collateral";

// Prefixed trove ID format: "branchId:troveId"
type PrefixedTroveId = string;
type BranchId = string; // "0" for WWBTC, "1" for UBTC, "2" for GBTC

const PRICE_CACHE_TTL_MS = 10_000;

type PriceCacheEntry = {
  value: bigint;
  fetchedAt: number;
};

const priceCache = new Map<CollateralId, PriceCacheEntry>();
const inFlightFetches = new Map<CollateralId, Promise<bigint>>();

export const getBitcoinprice = async (
  provider: RpcProvider,
  collateralId: CollateralId = "WWBTC"
) => {
  const cached = priceCache.get(collateralId);
  const now = Date.now();

  if (cached && now - cached.fetchedAt < PRICE_CACHE_TTL_MS) {
    return cached.value;
  }

  const inFlight = inFlightFetches.get(collateralId);
  if (inFlight) {
    return inFlight;
  }

  // Get the price feed for the specified collateral
  const collateral = getCollateral(collateralId);
  const fetchPromise = (async () => {
    const PriceFeedContract = new Contract({
      abi: PRICE_FEED_ABI,
      address: collateral.addresses.priceFeed,
      providerOrAccount: provider,
    });

    const result = await PriceFeedContract.get_price();
    priceCache.set(collateralId, { value: result, fetchedAt: Date.now() });
    return result;
  })();

  inFlightFetches.set(collateralId, fetchPromise);

  try {
    return await fetchPromise;
  } finally {
    inFlightFetches.delete(collateralId);
  }
};

// Helper functions for prefixed trove IDs
export function isPrefixedTroveId(id: string | null): id is PrefixedTroveId {
  if (!id) return false;
  const parts = id.split(":");
  return parts.length === 2 && !isNaN(Number(parts[0]));
}

export function parsePrefixedTroveId(prefixedId: PrefixedTroveId): {
  branchId: BranchId;
  troveId: string;
} {
  const [branchId, troveId] = prefixedId.split(":");
  if (!branchId || !troveId) {
    throw new Error(`Invalid prefixed trove ID: ${prefixedId}`);
  }
  return { branchId, troveId };
}
