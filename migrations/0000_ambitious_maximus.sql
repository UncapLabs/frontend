CREATE TABLE `ekubo_liquidity_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_address` text NOT NULL,
	`snapshot_time` integer NOT NULL,
	`liquidity_amount` real NOT NULL,
	`usdu_amount` real,
	`usdc_amount` real,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_ekubo_user_time` ON `ekubo_liquidity_snapshots` (`user_address`,`snapshot_time`);--> statement-breakpoint
CREATE INDEX `idx_ekubo_time` ON `ekubo_liquidity_snapshots` (`snapshot_time`);--> statement-breakpoint
CREATE TABLE `position_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_address` text NOT NULL,
	`trove_id` text NOT NULL,
	`snapshot_time` integer NOT NULL,
	`collateral_btc` real NOT NULL,
	`borrowed_usdu` real NOT NULL,
	`interest_rate` real,
	`collateral_ratio` real,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_snapshot_user_time` ON `position_snapshots` (`user_address`,`snapshot_time`);--> statement-breakpoint
CREATE INDEX `idx_snapshot_time` ON `position_snapshots` (`snapshot_time`);--> statement-breakpoint
CREATE TABLE `referral_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_address` text NOT NULL,
	`referral_code` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `referral_codes_user_address_unique` ON `referral_codes` (`user_address`);--> statement-breakpoint
CREATE UNIQUE INDEX `referral_codes_referral_code_unique` ON `referral_codes` (`referral_code`);--> statement-breakpoint
CREATE INDEX `idx_referral_code` ON `referral_codes` (`referral_code`);--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`referrer_address` text NOT NULL,
	`referee_address` text NOT NULL,
	`referral_code` text NOT NULL,
	`applied_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`applied_retroactively` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `referrals_referee_address_unique` ON `referrals` (`referee_address`);--> statement-breakpoint
CREATE INDEX `idx_referrals_referrer` ON `referrals` (`referrer_address`);--> statement-breakpoint
CREATE INDEX `idx_referrals_referee` ON `referrals` (`referee_address`);--> statement-breakpoint
CREATE TABLE `stability_pool_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_address` text NOT NULL,
	`snapshot_time` integer NOT NULL,
	`deposited_usdu` real NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_sp_user_time` ON `stability_pool_snapshots` (`user_address`,`snapshot_time`);--> statement-breakpoint
CREATE INDEX `idx_sp_time` ON `stability_pool_snapshots` (`snapshot_time`);--> statement-breakpoint
CREATE TABLE `user_points` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_address` text NOT NULL,
	`week_start` text NOT NULL,
	`season_number` integer NOT NULL,
	`week_number` integer NOT NULL,
	`base_points` real DEFAULT 0 NOT NULL,
	`referral_bonus` real DEFAULT 0 NOT NULL,
	`total_points` real DEFAULT 0 NOT NULL,
	`calculation_metadata` text,
	`calculated_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_user_week_unique` ON `user_points` (`user_address`,`week_start`);--> statement-breakpoint
CREATE INDEX `idx_user_points_user` ON `user_points` (`user_address`);--> statement-breakpoint
CREATE INDEX `idx_user_points_week` ON `user_points` (`week_start`);--> statement-breakpoint
CREATE INDEX `idx_user_points_season` ON `user_points` (`season_number`);--> statement-breakpoint
CREATE INDEX `idx_user_points_leaderboard` ON `user_points` (`season_number`,`total_points`);--> statement-breakpoint
CREATE TABLE `user_total_points` (
	`user_address` text PRIMARY KEY NOT NULL,
	`season_1_points` real DEFAULT 0 NOT NULL,
	`season_2_points` real DEFAULT 0 NOT NULL,
	`season_3_points` real DEFAULT 0 NOT NULL,
	`all_time_points` real DEFAULT 0 NOT NULL,
	`current_season_rank` integer,
	`total_referrals` integer DEFAULT 0 NOT NULL,
	`last_updated` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_total_points_rank` ON `user_total_points` (`all_time_points`);