import { Contract, RpcProvider } from "starknet";
import { PRICE_FEED_MOCK_ABI } from "~/lib/contracts";
import { getCollateral, type CollateralId } from "~/lib/collateral";
import * as z from "zod";

// Prefixed trove ID format: "branchId:troveId"
type PrefixedTroveId = string;
type BranchId = string; // "0" for WWBTC, "1" for UBTC, "2" for GBTC

export const CollateralIdSchema = z.enum(["WWBTC"]); //, "UBTC", "GBTC"]);

export const getBitcoinprice = async (collateralId: CollateralId = "WWBTC") => {
  const myProvider = new RpcProvider({
    nodeUrl: process.env.NODE_URL,
  });

  // Get the price feed for the specified collateral
  const collateral = getCollateral(collateralId);
  const PriceFeedContract = new Contract({
    abi: PRICE_FEED_MOCK_ABI,
    address: collateral.addresses.priceFeed,
    providerOrAccount: myProvider,
  });

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
