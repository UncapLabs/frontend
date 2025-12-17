import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import {
  getProtocolStats,
  getAllPositions,
  ALL_POSITIONS_PAGE_SIZE,
  type SortField,
  type SortDirection,
} from "../services/protocol-stats";

const sortFieldSchema = z.enum(["debt", "deposit", "interestRate", "createdAt", "updatedAt", "ltv", "liquidationPrice"]);
const sortDirectionSchema = z.enum(["asc", "desc"]);

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
        sortBy: sortFieldSchema.optional(),
        sortDirection: sortDirectionSchema.optional(),
        address: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return getAllPositions(ctx.env, {
        limit: input.limit ?? ALL_POSITIONS_PAGE_SIZE,
        offset: input.offset ?? 0,
        status: input.status ?? "active",
        sortBy: (input.sortBy as SortField) ?? "debt",
        sortDirection: (input.sortDirection as SortDirection) ?? "desc",
        address: input.address,
      });
    }),
});

export type ProtocolStatsRouter = typeof protocolStatsRouter;
