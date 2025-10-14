import { publicProcedure, router } from "../trpc";
import * as z from "zod";
import {
  generateReferralCode,
  applyReferralCode,
  getReferralInfo,
} from "../services/referral-service";
import { createDbClient } from "../db/client";
import { userPoints, userTotalPoints, referralCodes } from "../db/schema";
import { eq, sql, desc } from "drizzle-orm";

export const pointsRouter = router({
  // ==========================================
  // Points Queries
  // ==========================================

  getUserPoints: publicProcedure
    .input(z.object({ userAddress: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = createDbClient(ctx.env.DB);
      const normalizedAddress = input.userAddress.toLowerCase();

      // Get weekly breakdown
      const weeklyPoints = await db
        .select({
          weekStart: userPoints.weekStart,
          seasonNumber: userPoints.seasonNumber,
          weekNumber: userPoints.weekNumber,
          basePoints: userPoints.basePoints,
          referralBonus: userPoints.referralBonus,
          totalPoints: userPoints.totalPoints,
          calculatedAt: userPoints.calculatedAt,
        })
        .from(userPoints)
        .where(eq(userPoints.userAddress, normalizedAddress))
        .orderBy(desc(userPoints.weekStart))
        .all();

      // Get total points
      const totals = await db
        .select()
        .from(userTotalPoints)
        .where(eq(userTotalPoints.userAddress, normalizedAddress))
        .get();

      return {
        weeklyPoints: weeklyPoints || [],
        totals: totals || {
          season1Points: 0,
          season2Points: 0,
          season3Points: 0,
          allTimePoints: 0,
          currentSeasonRank: null,
        },
      };
    }),

  getLeaderboard: publicProcedure
    .input(
      z.object({
        seasonNumber: z.number().optional(),
        limit: z.number().min(10).max(500).default(100),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = createDbClient(ctx.env.DB);
      const { seasonNumber, limit, offset } = input;

      if (seasonNumber) {
        // Season-specific leaderboard
        const columnName = `season${seasonNumber}Points` as
          | "season1Points"
          | "season2Points"
          | "season3Points";

        const results = await db
          .select({
            userAddress: userTotalPoints.userAddress,
            points: userTotalPoints[columnName],
            totalReferrals: userTotalPoints.totalReferrals,
            rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${userTotalPoints[columnName]} DESC)`,
          })
          .from(userTotalPoints)
          .where(sql`${userTotalPoints[columnName]} > 0`)
          .orderBy(desc(userTotalPoints[columnName]))
          .limit(limit)
          .offset(offset)
          .all();

        const countResult = await db
          .select({ total: sql<number>`COUNT(*)` })
          .from(userTotalPoints)
          .where(sql`${userTotalPoints[columnName]} > 0`)
          .get();

        return {
          leaderboard: results || [],
          total: countResult?.total || 0,
          hasMore: offset + limit < (countResult?.total || 0),
        };
      } else {
        // All-time leaderboard
        const results = await db
          .select({
            userAddress: userTotalPoints.userAddress,
            points: userTotalPoints.allTimePoints,
            totalReferrals: userTotalPoints.totalReferrals,
            rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${userTotalPoints.allTimePoints} DESC)`,
          })
          .from(userTotalPoints)
          .where(sql`${userTotalPoints.allTimePoints} > 0`)
          .orderBy(desc(userTotalPoints.allTimePoints))
          .limit(limit)
          .offset(offset)
          .all();

        const countResult = await db
          .select({ total: sql<number>`COUNT(*)` })
          .from(userTotalPoints)
          .where(sql`${userTotalPoints.allTimePoints} > 0`)
          .get();

        return {
          leaderboard: results || [],
          total: countResult?.total || 0,
          hasMore: offset + limit < (countResult?.total || 0),
        };
      }
    }),

  getUserRank: publicProcedure
    .input(
      z.object({
        userAddress: z.string(),
        seasonNumber: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = createDbClient(ctx.env.DB);
      const normalizedAddress = input.userAddress.toLowerCase();
      const { seasonNumber } = input;

      const columnName = seasonNumber
        ? (`season${seasonNumber}Points` as
            | "season1Points"
            | "season2Points"
            | "season3Points")
        : "allTimePoints";

      const userRow = await db
        .select({
          points: userTotalPoints[columnName],
        })
        .from(userTotalPoints)
        .where(eq(userTotalPoints.userAddress, normalizedAddress))
        .get();

      const userPointsValue = userRow?.points ?? 0;

      if (!userRow || userPointsValue <= 0) {
        return { rank: null, points: 0 };
      }

      const higherRankCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(userTotalPoints)
        .where(sql`${userTotalPoints[columnName]} > ${userPointsValue}`)
        .get();

      const higherCount = higherRankCount?.count ?? 0;

      return {
        rank: higherCount + 1,
        points: userPointsValue,
      };
    }),

  // ==========================================
  // Referral Mutations
  // ==========================================

  generateReferralCode: publicProcedure
    .input(z.object({ userAddress: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const code = await generateReferralCode(input.userAddress, ctx.env);
      return { referralCode: code };
    }),

  applyReferralCode: publicProcedure
    .input(
      z.object({
        userAddress: z.string(),
        referralCode: z.string().min(6).max(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await applyReferralCode(
        input.userAddress,
        input.referralCode,
        ctx.env
      );
      return result;
    }),

  // ==========================================
  // Referral Queries
  // ==========================================

  getReferralInfo: publicProcedure
    .input(z.object({ userAddress: z.string() }))
    .query(async ({ input, ctx }) => {
      const info = await getReferralInfo(input.userAddress, ctx.env);
      return info;
    }),

  validateReferralCode: publicProcedure
    .input(z.object({ referralCode: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = createDbClient(ctx.env.DB);
      const result = await db
        .select()
        .from(referralCodes)
        .where(
          eq(
            referralCodes.referralCode,
            input.referralCode.toUpperCase().trim()
          )
        )
        .get();

      return { valid: !!result };
    }),
});

export type PointsRouter = typeof pointsRouter;
