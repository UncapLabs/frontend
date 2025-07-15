import { publicProcedure, router } from "../trpc";
import { getBitcoinprice } from "workers/services/utils";

export const priceRouter = router({
  getBitcoinPrice: publicProcedure.query(async ({ ctx }) => {
    const price = await getBitcoinprice();
    const rawPrice = price[0];
    return {
      price: Number(rawPrice) / 1e18,
    };
  }),
  getBitUSDPrice: publicProcedure.query(({ ctx }) => {
    return {
      price: 1.0,
    };
  }),
});

export type PriceRouter = typeof priceRouter;
