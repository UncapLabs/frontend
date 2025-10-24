CREATE TABLE `referral_point_breakdowns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`referrer_address` text NOT NULL,
	`referee_address` text NOT NULL,
	`week_start` text NOT NULL,
	`season_number` integer NOT NULL,
	`week_number` integer NOT NULL,
	`referee_base_points` real DEFAULT 0 NOT NULL,
	`bonus_points` real DEFAULT 0 NOT NULL,
	`calculated_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_referral_breakdown_unique` ON `referral_point_breakdowns` (`referrer_address`,`referee_address`,`week_start`);--> statement-breakpoint
CREATE INDEX `idx_referral_breakdown_referrer` ON `referral_point_breakdowns` (`referrer_address`);--> statement-breakpoint
CREATE INDEX `idx_referral_breakdown_referee` ON `referral_point_breakdowns` (`referee_address`);--> statement-breakpoint
CREATE INDEX `idx_referral_breakdown_week` ON `referral_point_breakdowns` (`week_start`);