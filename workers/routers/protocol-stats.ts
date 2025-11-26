import { publicProcedure, router } from "../trpc";
import { getProtocolStats } from "../services/protocol-stats";

export const protocolStatsRouter = router({
  getStats: publicProcedure.query(async ({ ctx }) => {
    return getProtocolStats(ctx.env);
  }),
});

export type ProtocolStatsRouter = typeof protocolStatsRouter;
