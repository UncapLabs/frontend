import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { RpcProvider } from "starknet";
import { contractRead } from "~/lib/contracts/calls";
import { getBitcoinprice } from "../services/utils";
import type { CollateralType } from "~/lib/contracts/constants";
import * as dn from "dnum";
import { dnum18 } from "~/lib/decimal";

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
        const price = dnum18(priceResult[0] as bigint);

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
        const ccr = dnum18(ccrResult);

        // Convert to dnum for calculations
        const totalCollateralDnum = dnum18(totalCollateral);
        const totalDebtDnum = dnum18(totalDebt);

        // Calculate TCR
        // TCR = (totalCollateral * price) / totalDebt
        let tcr: number | null = null;
        let isBelowCcr = false;

        if (dn.gt(totalDebtDnum, dn.from(0, 18))) {
          // Calculate collateral value in USD
          const collateralValueInUSD = dn.div(
            dn.mul(totalCollateralDnum, price),
            dn.from(1, 18)
          );

          // TCR = collateral value / debt
          const tcrDnum = dn.div(collateralValueInUSD, totalDebtDnum);
          tcr = dn.toNumber(tcrDnum);

          // Check if TCR is below CCR
          isBelowCcr = dn.lt(tcrDnum, ccr);
        }

        return {
          tcr,
          ccr: dn.toNumber(ccr),
          isBelowCcr,
          totalCollateral: dn.toNumber(totalCollateralDnum),
          totalDebt: dn.toNumber(totalDebtDnum),
        };
      } catch (error) {
        console.error("Error fetching TCR:", error);
        throw new Error("Failed to fetch TCR data");
      }
    }),
});

export type BranchRouter = typeof branchRouter;
