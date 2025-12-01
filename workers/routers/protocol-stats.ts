import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import {
  getProtocolStats,
  getAllPositions,
  ALL_POSITIONS_PAGE_SIZE,
} from "../services/protocol-stats";

export const protocolStatsRouter = router({
  getStats: publicProcedure.query(async ({ ctx }) => {
    return getProtocolStats(ctx.env);
  }),

  getAllPositions: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
        status: z.enum(["active", "closed", "liquidated", "redeemed"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return getAllPositions(ctx.env, {
        limit: input.limit ?? ALL_POSITIONS_PAGE_SIZE,
        offset: input.offset ?? 0,
        status: input.status ?? "active",
      });
    }),
});

export type ProtocolStatsRouter = typeof protocolStatsRouter;
