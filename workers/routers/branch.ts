import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { RpcProvider } from "starknet";
import { contractRead } from "~/lib/contracts/calls";
import { getBitcoinprice } from "../services/utils";
import type { CollateralType } from "~/lib/contracts/constants";
import { bigintToBig } from "~/lib/decimal";
import Big from "big.js";

export const branchRouter = router({
  getTCR: publicProcedure
    .input(
      z.object({
        branchId: z.enum(["UBTC", "GBTC"]),
      })
    )
    .query(async ({ input }) => {
      const provider = new RpcProvider({
        nodeUrl: process.env.NODE_URL,
      });

      try {
        // Get current price
        const priceResult = await getBitcoinprice(
          input.branchId as CollateralType
        );
        const priceBig = bigintToBig(priceResult[0] as bigint, 18);

        // Get branch data
        const { totalCollateral, totalDebt } =
          await contractRead.troveManager.getBranchTCR(
            provider,
            input.branchId as CollateralType
          );

        const ccrResult = await contractRead.addressesRegistry.getCcr(
          provider,
          input.branchId as CollateralType
        );

        // Convert to Big for precise calculations
        const totalCollateralBig = bigintToBig(totalCollateral, 18);
        const totalDebtBig = bigintToBig(totalDebt, 18);
        const ccrBig = bigintToBig(ccrResult, 18);

        // Calculate TCR
        // TCR = (totalCollateral * price) / totalDebt
        let tcr: Big | null = null;
        let isBelowCcr = false;

        if (totalDebtBig.gt(0)) {
          // Calculate collateral value in USD
          const collateralValueInUSD = totalCollateralBig.times(priceBig);

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
          totalDebt: totalDebtBig,
        };
      } catch (error) {
        console.error("Error fetching TCR:", error);
        throw new Error("Failed to fetch TCR data");
      }
    }),
});

export type BranchRouter = typeof branchRouter;
