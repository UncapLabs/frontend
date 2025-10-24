import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ============================================
// User Points (Calculated Weekly)
// ============================================
export const userPoints = sqliteTable(
  "user_points",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userAddress: text("user_address").notNull(),
    weekStart: text("week_start").notNull(), // ISO date string
    seasonNumber: integer("season_number").notNull(),
    weekNumber: integer("week_number").notNull(),
    basePoints: real("base_points").notNull().default(0),
    referralBonus: real("referral_bonus").notNull().default(0),
    totalPoints: real("total_points").notNull().default(0),
    calculationMetadata: text("calculation_metadata"), // JSON
    calculatedAt: integer("calculated_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (table) => ({
    uniqueUserWeek: uniqueIndex("idx_user_week_unique").on(
      table.userAddress,
      table.weekStart
    ),
    userIdx: index("idx_user_points_user").on(table.userAddress),
    weekIdx: index("idx_user_points_week").on(table.weekStart),
    seasonIdx: index("idx_user_points_season").on(table.seasonNumber),
    leaderboardIdx: index("idx_user_points_leaderboard").on(
      table.seasonNumber,
      table.totalPoints
    ),
  })
);

// ============================================
// Referral Codes
// ============================================
export const referralCodes = sqliteTable(
  "referral_codes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userAddress: text("user_address").notNull().unique(),
    referralCode: text("referral_code").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (table) => ({
    codeIdx: index("idx_referral_code").on(table.referralCode),
  })
);

// ============================================
// Referral Relationships
// ============================================
export const referrals = sqliteTable(
  "referrals",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    referrerAddress: text("referrer_address").notNull(),
    refereeAddress: text("referee_address").notNull().unique(),
    refereeAnonymousName: text("referee_anonymous_name").notNull(), // Generated anonymous display name
    referralCode: text("referral_code").notNull(),
    appliedAt: integer("applied_at", { mode: "timestamp_ms" })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
    appliedRetroactively: integer("applied_retroactively", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (table) => ({
    referrerIdx: index("idx_referrals_referrer").on(table.referrerAddress),
    refereeIdx: index("idx_referrals_referee").on(table.refereeAddress),
  })
);

export const referralPointBreakdowns = sqliteTable(
  "referral_point_breakdowns",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    referrerAddress: text("referrer_address").notNull(),
    refereeAddress: text("referee_address").notNull(),
    weekStart: text("week_start").notNull(),
    seasonNumber: integer("season_number").notNull(),
    weekNumber: integer("week_number").notNull(),
    refereeBasePoints: real("referee_base_points").notNull().default(0),
    bonusPoints: real("bonus_points").notNull().default(0),
    calculatedAt: integer("calculated_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (table) => ({
    uniqueBreakdown: uniqueIndex("idx_referral_breakdown_unique").on(
      table.referrerAddress,
      table.refereeAddress,
      table.weekStart
    ),
    referrerIdx: index("idx_referral_breakdown_referrer").on(
      table.referrerAddress
    ),
    refereeIdx: index("idx_referral_breakdown_referee").on(
      table.refereeAddress
    ),
    weekIdx: index("idx_referral_breakdown_week").on(table.weekStart),
  })
);

// ============================================
// Aggregated User Stats (for quick lookups)
// ============================================
export const userTotalPoints = sqliteTable(
  "user_total_points",
  {
    userAddress: text("user_address").primaryKey(),
    season1Points: real("season_1_points").notNull().default(0),
    season2Points: real("season_2_points").notNull().default(0),
    season3Points: real("season_3_points").notNull().default(0),
    allTimePoints: real("all_time_points").notNull().default(0),
    lastUpdated: integer("last_updated", { mode: "timestamp_ms" })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (table) => ({
    rankIdx: index("idx_total_points_rank").on(table.allTimePoints),
  })
);

// Type exports for use in application code
export type UserPoints = typeof userPoints.$inferSelect;
export type NewUserPoints = typeof userPoints.$inferInsert;

export type ReferralCode = typeof referralCodes.$inferSelect;
export type NewReferralCode = typeof referralCodes.$inferInsert;

export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;

export type ReferralPointBreakdown =
  typeof referralPointBreakdowns.$inferSelect;
export type NewReferralPointBreakdown =
  typeof referralPointBreakdowns.$inferInsert;

export type UserTotalPoints = typeof userTotalPoints.$inferSelect;
export type NewUserTotalPoints = typeof userTotalPoints.$inferInsert;
