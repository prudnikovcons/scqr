ALTER TABLE `packs` ADD `weekly_digest` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `sources` ADD `consecutive_errors` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `signals_source_url_idx` ON `signals` (`source_id`,`url`);