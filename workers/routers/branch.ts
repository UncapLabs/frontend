import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { RpcProvider } from "starknet";
import { contractRead } from "~/lib/contracts/calls";
import { getBitcoinprice } from "../services/utils";
import type { CollateralType } from "~/lib/contracts/constants";

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
        const price = priceResult[0] as bigint;

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
        const ccr = ccrResult.ccr as bigint;

        // Calculate TCR
        // TCR = (totalCollateral * price) / totalDebt
        let tcr: number | null = null;
        let isBelowCcr = false;

        if (totalDebt > 0n) {
          // Calculate collateral value in USD (both coll and price are in 18 decimals)
          const collateralValueInUSD = (totalCollateral * price) / 10n ** 18n;
          // TCR = collateral value / debt (both in 18 decimals)
          const tcrBigInt = (collateralValueInUSD * 10n ** 18n) / totalDebt;
          tcr = Number(tcrBigInt) / 1e18; // Convert to decimal ratio

          // Check if TCR is below CCR (both as bigints for accuracy)
          isBelowCcr = tcrBigInt < ccr;

          console.log("TCR Calculation:", {
            collateralValueInUSD: (
              Number(collateralValueInUSD) / 1e18
            ).toString(),
            tcrBigInt: tcrBigInt.toString(),
            tcrDecimal: tcr,
            ccrBigInt: ccr.toString(),
            isBelowCcr,
          });
        }

        const ccrNumber = Number(ccr) / 1e18; // Convert from 18 decimals

        return {
          tcr,
          ccr: ccrNumber,
          isBelowCcr,
          totalCollateral: Number(totalCollateral) / 1e18,
          totalDebt: Number(totalDebt) / 1e18,
        };
      } catch (error) {
        console.error("Error fetching TCR:", error);
        throw new Error("Failed to fetch TCR data");
      }
    }),
});

export type BranchRouter = typeof branchRouter;
