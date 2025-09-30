import { publicProcedure, router } from "../trpc";
import { getBitcoinprice } from "workers/services/utils";
import { z } from "zod";
import type { CollateralType } from "~/lib/contracts/constants";
import { bigintToBig } from "~/lib/decimal";
import Big from "big.js";

export const priceRouter = router({
  getBitcoinPrice: publicProcedure
    .input(
      z.object({
        collateralType: z.enum(["UBTC", "GBTC"]).optional().default("UBTC"),
      })
    )
    .query(async ({ input }) => {
      const price = await getBitcoinprice(
        input.collateralType as CollateralType
      );
      // Convert bigint directly to Big to preserve full precision
      return {
        price: bigintToBig(price[0] as bigint, 18),
      };
    }),
  getUSDUPrice: publicProcedure.query(({}) => {
    // Return as Big instance for consistency
    return {
      price: new Big(1.0),
    };
  }),
});

export type PriceRouter = typeof priceRouter;
