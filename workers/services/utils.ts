import { Contract, RpcProvider } from "starknet";
import { PRICE_FEED_ABI } from "~/lib/contracts";
import {
  getCollateralAddresses,
  INTEREST_RATE_SCALE_DOWN_FACTOR,
  type CollateralType,
} from "~/lib/contracts/constants";

// Prefixed trove ID format: "branchId:troveId"
type PrefixedTroveId = string;
type BranchId = string; // "0" for UBTC, "1" for GBTC

export const getBitcoinprice = async (
  collateralType: CollateralType = "UBTC"
) => {
  const myProvider = new RpcProvider({
    nodeUrl: process.env.NODE_URL,
  });

  // Get the price feed for the specified collateral type
  const addresses = getCollateralAddresses(collateralType);
  const PriceFeedContract = new Contract(
    PRICE_FEED_ABI,
    addresses.priceFeed,
    myProvider
  );

  const result = await PriceFeedContract.fetch_price();

  return result;
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

export const formatBigIntToNumber = (
  value: bigint,
  decimals: number
): number => {
  if (decimals === 0) return Number(value);
  const factor = Math.pow(10, decimals);
  return Number(value.toString()) / factor;
};

export const formatInterestRateForDisplay = (rawValue: bigint): number => {
  return Number(rawValue) / Number(INTEREST_RATE_SCALE_DOWN_FACTOR);
};
