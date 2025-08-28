import { publicProcedure, router } from "../trpc";
import { getBitcoinprice } from "workers/services/utils";
import { z } from "zod";
import type { CollateralType } from "~/lib/contracts/constants";
import * as dn from "dnum";
import { dnum18 } from "~/lib/decimal";

export const priceRouter = router({
  getBitcoinPrice: publicProcedure
    .input(
      z.object({
        collateralType: z.enum(["UBTC", "GBTC"]).optional().default("UBTC"),
      })
    )
    .query(async ({ ctx, input }) => {
      const price = await getBitcoinprice(input.collateralType as CollateralType);
      const rawPrice = dnum18(price[0] as bigint);
      return {
        price: dn.toNumber(rawPrice),
      };
    }),
  getUSDUPrice: publicProcedure.query(({ ctx }) => {
    return {
      price: 1.0,
    };
  }),
});

export type PriceRouter = typeof priceRouter;
