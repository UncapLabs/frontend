import { publicProcedure, router } from "../trpc";
import { getBitcoinprice } from "workers/services/utils";
import { z } from "zod";
import type { CollateralType } from "~/lib/contracts/constants";

export const priceRouter = router({
  getBitcoinPrice: publicProcedure
    .input(
      z.object({
        collateralType: z.enum(["UBTC", "GBTC"]).optional().default("UBTC"),
      })
    )
    .query(async ({ ctx, input }) => {
      const price = await getBitcoinprice(input.collateralType as CollateralType);
      const rawPrice = price[0];
      return {
        price: Number(rawPrice) / 1e18,
      };
    }),
  getUSDUPrice: publicProcedure.query(({ ctx }) => {
    return {
      price: 1.0,
    };
  }),
});

export type PriceRouter = typeof priceRouter;
