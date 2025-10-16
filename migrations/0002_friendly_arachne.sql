DROP INDEX `idx_user_week_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_user_week_unique` ON `user_points` (`user_address`,`week_start`);