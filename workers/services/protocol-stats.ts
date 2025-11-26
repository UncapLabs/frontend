import { RpcProvider } from "starknet";
import { contractRead } from "~/lib/contracts/calls";
import { COLLATERAL_LIST, type CollateralId } from "~/lib/collateral";
import { getBitcoinprice } from "./utils";
import { bigintToBig } from "~/lib/decimal";
import Big from "big.js";

const CACHE_KEY = "protocol-stats";
const CACHE_TTL = 30 * 60; // 30 minutes

export interface ProtocolStats {
  totalCollateralUSD: string;
  totalUsduCirculation: string;
}

/**
 * Fetches aggregated protocol stats (total collateral USD and USDU in circulation)
 * Results are cached in KV store for 30 minutes
 */
export async function getProtocolStats(env: Env): Promise<ProtocolStats> {
  // Try to get from KV cache first
  const cached = await env.CACHE.get(CACHE_KEY, "json");
  if (cached) {
    return cached as ProtocolStats;
  }

  const provider = new RpcProvider({ nodeUrl: env.NODE_URL });

  // Fetch data for all collaterals in parallel
  const branchDataPromises = COLLATERAL_LIST.map(async (collateral) => {
    const branchId = collateral.id as CollateralId;

    // Get price and branch data in parallel
    const [priceResult, branchData] = await Promise.all([
      getBitcoinprice(provider, branchId),
      contractRead.troveManager.getBranchTCR(provider, branchId),
    ]);

    const priceBig = bigintToBig(priceResult, 18);
    const totalCollateralBig = bigintToBig(branchData.totalCollateral, 18);
    const totalDebtBig = bigintToBig(branchData.totalDebt, 18);

    // Calculate collateral value in USD
    const collateralValueInUSD = totalCollateralBig.times(priceBig);

    return {
      totalCollateralUSD: collateralValueInUSD,
      totalDebt: totalDebtBig,
    };
  });

  const branchResults = await Promise.all(branchDataPromises);

  // Sum up totals across all branches
  let totalCollateralUSD = new Big(0);
  let totalUsduCirculation = new Big(0);

  for (const branch of branchResults) {
    totalCollateralUSD = totalCollateralUSD.plus(branch.totalCollateralUSD);
    totalUsduCirculation = totalUsduCirculation.plus(branch.totalDebt);
  }

  const result: ProtocolStats = {
    totalCollateralUSD: totalCollateralUSD.toString(),
    totalUsduCirculation: totalUsduCirculation.toString(),
  };

  // Cache the result in KV store
  await env.CACHE.put(CACHE_KEY, JSON.stringify(result), {
    expirationTtl: CACHE_TTL,
  });

  return result;
}
