import { publicProcedure, router } from "../trpc";
import { getUncapIncentiveRates } from "../services/incentives";

export const incentivesRouter = router({
  getUncapRates: publicProcedure.query(async ({ ctx }) => {
    return getUncapIncentiveRates(ctx.env);
  }),
});

export type IncentivesRouter = typeof incentivesRouter;
