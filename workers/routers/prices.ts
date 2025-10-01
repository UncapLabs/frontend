import { publicProcedure, router } from "../trpc";
import { CollateralIdSchema, getBitcoinprice } from "workers/services/utils";
import { z } from "zod";
import { bigintToBig } from "~/lib/decimal";

import Big from "big.js";

export const priceRouter = router({
  getBitcoinPrice: publicProcedure
    .input(
      z.object({
        collateralType: CollateralIdSchema,
      })
    )
    .query(async ({ input }) => {
      const price = await getBitcoinprice(input.collateralType);
      return {
        price: bigintToBig(price, 18),
      };
    }),
  getUSDUPrice: publicProcedure.query(({}) => {
    return {
      price: new Big(1.0),
    };
  }),
});

export type PriceRouter = typeof priceRouter;
