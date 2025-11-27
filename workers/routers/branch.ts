import { publicProcedure, router } from "../trpc";
import * as z from "zod";
import { RpcProvider } from "starknet";
import { contractRead } from "~/lib/contracts/calls";
import { getBitcoinprice } from "../services/utils";
import { CollateralIdSchema, type CollateralId } from "~/lib/collateral";
import { bigintToBig } from "~/lib/decimal";
import Big from "big.js";

const CACHE_TTL = 5 * 60; // 5 minutes

interface CachedTCRData {
  tcr: string | null;
  ccr: string;
  isBelowCcr: boolean;
  totalCollateral: string;
  totalCollateralUSD: string;
  totalDebt: string;
}

async function getCachedTCR(
  env: Env,
  provider: RpcProvider,
  branchId: CollateralId
) {
  const cacheKey = `branch-tcr-${branchId}`;

  // Try to get from KV cache first
  const cached = await env.CACHE.get(cacheKey, "json");
  if (cached) {
    const data = cached as CachedTCRData;
    return {
      tcr: data.tcr ? new Big(data.tcr) : null,
      ccr: new Big(data.ccr),
      isBelowCcr: data.isBelowCcr,
      totalCollateral: new Big(data.totalCollateral),
      totalCollateralUSD: new Big(data.totalCollateralUSD),
      totalDebt: new Big(data.totalDebt),
    };
  }

  // Get current price
  const priceResult = await getBitcoinprice(provider, branchId);
  const priceBig = bigintToBig(priceResult, 18);

  // Get branch data
  const { totalCollateral, totalDebt } =
    await contractRead.troveManager.getBranchTCR(provider, branchId);

  const ccrResult = await contractRead.addressesRegistry.getCcr(
    provider,
    branchId
  );

  // Convert to Big for precise calculations
  const totalCollateralBig = bigintToBig(totalCollateral, 18);
  const totalDebtBig = bigintToBig(totalDebt, 18);
  const ccrBig = bigintToBig(ccrResult, 18);

  // Calculate TCR
  // TCR = (totalCollateral * price) / totalDebt
  let tcr: Big | null = null;
  let isBelowCcr = false;

  // Calculate collateral value in USD
  const collateralValueInUSD = totalCollateralBig.times(priceBig);

  if (totalDebtBig.gt(0)) {
    // TCR = collateral value / debt
    tcr = collateralValueInUSD.div(totalDebtBig);

    // Check if TCR is below CCR
    isBelowCcr = tcr.lt(ccrBig);
  }

  const result = {
    tcr,
    ccr: ccrBig,
    isBelowCcr,
    totalCollateral: totalCollateralBig,
    totalCollateralUSD: collateralValueInUSD,
    totalDebt: totalDebtBig,
  };

  // Cache the result
  const cacheData: CachedTCRData = {
    tcr: tcr?.toString() ?? null,
    ccr: ccrBig.toString(),
    isBelowCcr,
    totalCollateral: totalCollateralBig.toString(),
    totalCollateralUSD: collateralValueInUSD.toString(),
    totalDebt: totalDebtBig.toString(),
  };

  await env.CACHE.put(cacheKey, JSON.stringify(cacheData), {
    expirationTtl: CACHE_TTL,
  });

  return result;
}

export const branchRouter = router({
  getTCR: publicProcedure
    .input(
      z.object({
        branchId: CollateralIdSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      const provider = new RpcProvider({ nodeUrl: ctx.env.NODE_URL });

      try {
        return await getCachedTCR(ctx.env, provider, input.branchId);
      } catch (error) {
        console.error("Error fetching TCR:", error);
        throw new Error("Failed to fetch TCR data");
      }
    }),
});

export type BranchRouter = typeof branchRouter;
