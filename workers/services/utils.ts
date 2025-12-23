import { Contract, RpcProvider } from "starknet";
import { PRICE_FEED_ABI } from "~/lib/contracts";
import { getCollateral, type CollateralId } from "~/lib/collateral";

// Prefixed trove ID format: "branchId:troveId"
type PrefixedTroveId = string;
type BranchId = string; // "0" for WWBTC, "1" for TBTC, "2" for SOLVBTC

export const getBitcoinprice = async (
  provider: RpcProvider,
  collateralId: CollateralId = "WWBTC"
) => {
  const collateral = getCollateral(collateralId);
  const PriceFeedContract = new Contract({
    abi: PRICE_FEED_ABI,
    address: collateral.addresses.priceFeed,
    providerOrAccount: provider,
  });

  return await PriceFeedContract.get_price();
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
