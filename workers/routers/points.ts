import { publicProcedure, router } from "../trpc";
import * as z from "zod";
import {
  generateReferralCode,
  applyReferralCode,
  getReferralInfo,
} from "../services/referral-service";
import { createDbClient } from "../db/client";
import { userPoints, userTotalPoints, referralCodes, referrals } from "../db/schema";
import { eq, sql, desc } from "drizzle-orm";

const LEADERBOARD_DEFAULT_LIMIT = 50;
const LEADERBOARD_MAX_LIMIT = 500;
const SEASON_NUMBERS = [1, 2, 3] as const;
type SeasonNumber = (typeof SEASON_NUMBERS)[number];

function getPointsColumn(season?: SeasonNumber) {
  switch (season) {
    case 1:
      return userTotalPoints.season1Points;
    case 2:
      return userTotalPoints.season2Points;
    case 3:
      return userTotalPoints.season3Points;
    default:
      return userTotalPoints.allTimePoints;
  }
}

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
        seasonNumber: z
          .number()
          .int()
          .refine(
            (value) => SEASON_NUMBERS.includes(value as SeasonNumber),
            "Unsupported season number"
          )
          .optional(),
        limit: z
          .number()
          .int()
          .min(1)
          .max(LEADERBOARD_MAX_LIMIT)
          .default(LEADERBOARD_DEFAULT_LIMIT),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = createDbClient(ctx.env.DB);
      const { seasonNumber, limit, offset } = input;

      const season = seasonNumber as SeasonNumber | undefined;
      const pointsColumn = getPointsColumn(season);

      const normalizedLimit = Math.min(Math.max(limit, 1), LEADERBOARD_MAX_LIMIT);
      const normalizedOffset = Math.max(offset, 0);

      const positivePointsFilter = sql`${pointsColumn} > 0`;

      // Create a subquery for counting referrals
      const referralCountSubquery = db
        .select({
          referrerAddress: referrals.referrerAddress,
          count: sql<number>`COUNT(*)`.as("referral_count"),
        })
        .from(referrals)
        .groupBy(referrals.referrerAddress)
        .as("referral_counts");

      const [rows, countResult] = await Promise.all([
        db
          .select({
            userAddress: userTotalPoints.userAddress,
            points: pointsColumn,
            totalReferrals: sql<number>`COALESCE(${referralCountSubquery.count}, 0)`,
          })
          .from(userTotalPoints)
          .leftJoin(
            referralCountSubquery,
            eq(userTotalPoints.userAddress, referralCountSubquery.referrerAddress)
          )
          .where(positivePointsFilter)
          .orderBy(desc(pointsColumn))
          .limit(normalizedLimit)
          .offset(normalizedOffset)
          .all(),
        db
          .select({ total: sql<number>`COUNT(*)` })
          .from(userTotalPoints)
          .where(positivePointsFilter)
          .get(),
      ]);

      const totalCount = countResult?.total ?? 0;
      const leaderboard = (rows || []).map((row, index) => ({
        ...row,
        rank: normalizedOffset + index + 1,
      }));
      const pageCount =
        normalizedLimit > 0 && totalCount > 0
          ? Math.ceil(totalCount / normalizedLimit)
          : 0;

      return {
        leaderboard,
        total: totalCount,
        hasMore: normalizedOffset + leaderboard.length < totalCount,
        pageCount,
      };
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
