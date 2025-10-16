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
// Position Snapshots (Raw Data)
// ============================================
export const positionSnapshots = sqliteTable(
  "position_snapshots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userAddress: text("user_address").notNull(),
    troveId: text("trove_id").notNull(),
    snapshotTime: integer("snapshot_time", { mode: "timestamp_ms" }).notNull(),
    collateralBtc: real("collateral_btc").notNull(),
    borrowedUsdu: real("borrowed_usdu").notNull(),
    interestRate: real("interest_rate"),
    collateralRatio: real("collateral_ratio"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (table) => ({
    userTimeIdx: index("idx_snapshot_user_time").on(
      table.userAddress,
      table.snapshotTime
    ),
    timeIdx: index("idx_snapshot_time").on(table.snapshotTime),
  })
);

// ============================================
// Stability Pool Snapshots (Raw Data)
// ============================================
export const stabilityPoolSnapshots = sqliteTable(
  "stability_pool_snapshots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userAddress: text("user_address").notNull(),
    snapshotTime: integer("snapshot_time", { mode: "timestamp_ms" }).notNull(),
    depositedUsdu: real("deposited_usdu").notNull(), // Amount of USDU deposited
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (table) => ({
    userTimeIdx: index("idx_sp_user_time").on(
      table.userAddress,
      table.snapshotTime
    ),
    timeIdx: index("idx_sp_time").on(table.snapshotTime),
  })
);

// ============================================
// Ekubo Liquidity Snapshots (Raw Data)
// ============================================
export const ekuboLiquiditySnapshots = sqliteTable(
  "ekubo_liquidity_snapshots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userAddress: text("user_address").notNull(),
    snapshotTime: integer("snapshot_time", { mode: "timestamp_ms" }).notNull(),
    liquidityAmount: real("liquidity_amount").notNull(), // Liquidity position value in USD or token units
    usduAmount: real("usdu_amount"), // USDU side of the pair
    usdcAmount: real("usdc_amount"), // USDC side of the pair
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (table) => ({
    userTimeIdx: index("idx_ekubo_user_time").on(
      table.userAddress,
      table.snapshotTime
    ),
    timeIdx: index("idx_ekubo_time").on(table.snapshotTime),
  })
);

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
    currentSeasonRank: integer("current_season_rank"),
    totalReferrals: integer("total_referrals").notNull().default(0),
    lastUpdated: integer("last_updated", { mode: "timestamp_ms" })
      .default(sql`(unixepoch() * 1000)`)
      .notNull(),
  },
  (table) => ({
    rankIdx: index("idx_total_points_rank").on(table.allTimePoints),
  })
);

// Type exports for use in application code
export type PositionSnapshot = typeof positionSnapshots.$inferSelect;
export type NewPositionSnapshot = typeof positionSnapshots.$inferInsert;

export type StabilityPoolSnapshot = typeof stabilityPoolSnapshots.$inferSelect;
export type NewStabilityPoolSnapshot =
  typeof stabilityPoolSnapshots.$inferInsert;

export type EkuboLiquiditySnapshot =
  typeof ekuboLiquiditySnapshots.$inferSelect;
export type NewEkuboLiquiditySnapshot =
  typeof ekuboLiquiditySnapshots.$inferInsert;

export type UserPoints = typeof userPoints.$inferSelect;
export type NewUserPoints = typeof userPoints.$inferInsert;

export type ReferralCode = typeof referralCodes.$inferSelect;
export type NewReferralCode = typeof referralCodes.$inferInsert;

export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;

export type UserTotalPoints = typeof userTotalPoints.$inferSelect;
export type NewUserTotalPoints = typeof userTotalPoints.$inferInsert;
