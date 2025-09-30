import { Contract, RpcProvider } from "starknet";
import { PRICE_FEED_MOCK_ABI } from "~/lib/contracts";
import {
  getCollateralAddresses,
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
    PRICE_FEED_MOCK_ABI,
    addresses.priceFeed,
    myProvider
  );

  const result = await PriceFeedContract.get_price();

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
