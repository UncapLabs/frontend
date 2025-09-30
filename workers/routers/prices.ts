import { publicProcedure, router } from "../trpc";
import { getBitcoinprice } from "workers/services/utils";
import { z } from "zod";
import {
  CollateralTypeSchema,
  type CollateralType,
} from "~/lib/contracts/constants";
import { bigintToBig } from "~/lib/decimal";
import Big from "big.js";

export const priceRouter = router({
  getBitcoinPrice: publicProcedure
    .input(
      z.object({
        collateralType: CollateralTypeSchema.optional().default("UBTC"),
      })
    )
    .query(async ({ input }) => {
      const price = await getBitcoinprice(
        input.collateralType as CollateralType
      );
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
