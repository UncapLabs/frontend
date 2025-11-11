import { publicProcedure, router } from "../trpc";
import * as z from "zod";
import { RpcProvider } from "starknet";
import { contractRead } from "~/lib/contracts/calls";
import { getBitcoinprice } from "../services/utils";
import { CollateralIdSchema } from "~/lib/collateral";
import { bigintToBig } from "~/lib/decimal";
import Big from "big.js";

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
        // Get current price
        const priceResult = await getBitcoinprice(provider, input.branchId);
        console.log("provider", provider);
        console.log("input.branchId", input.branchId);
        console.log("priceResult", priceResult);
        const priceBig = bigintToBig(priceResult, 18);

        // Get branch data
        const { totalCollateral, totalDebt } =
          await contractRead.troveManager.getBranchTCR(
            provider,
            input.branchId
          );
        console.log("totalCollateral", totalCollateral);
        console.log("totalDebt", totalDebt);

        const ccrResult = await contractRead.addressesRegistry.getCcr(
          provider,
          input.branchId
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

        return {
          tcr,
          ccr: ccrBig,
          isBelowCcr,
          totalCollateral: totalCollateralBig,
          totalCollateralUSD: collateralValueInUSD,
          totalDebt: totalDebtBig,
        };
      } catch (error) {
        console.error("Error fetching TCR:", error);
        throw new Error("Failed to fetch TCR data");
      }
    }),
});

export type BranchRouter = typeof branchRouter;
