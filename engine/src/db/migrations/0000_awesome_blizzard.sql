CREATE TABLE `article_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`signal_id` integer,
	`review_action_id` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`slug` text,
	`job_dir` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`completed_at` integer,
	`published_article_slug` text,
	`error_message` text,
	FOREIGN KEY (`signal_id`) REFERENCES `signals`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`review_action_id`) REFERENCES `review_actions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `article_jobs_status_idx` ON `article_jobs` (`status`);--> statement-breakpoint
CREATE INDEX `article_jobs_signal_idx` ON `article_jobs` (`signal_id`);--> statement-breakpoint
CREATE TABLE `decision_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`decision` text NOT NULL,
	`reason` text,
	`decided_by` text NOT NULL,
	`decided_at` integer DEFAULT (unixepoch()) NOT NULL,
	`metadata_json` text
);
--> statement-breakpoint
CREATE INDEX `decision_log_entity_idx` ON `decision_log` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `decision_log_decided_at_idx` ON `decision_log` (`decided_at`);--> statement-breakpoint
CREATE TABLE `memory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`week` text NOT NULL,
	`topic` text NOT NULL,
	`observation` text NOT NULL,
	`tags_csv` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`source` text DEFAULT 'retro' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `memory_week_idx` ON `memory` (`week`);--> statement-breakpoint
CREATE INDEX `memory_topic_idx` ON `memory` (`topic`);--> statement-breakpoint
CREATE TABLE `pack_items` (
	`pack_id` integer NOT NULL,
	`signal_id` integer NOT NULL,
	`ordering` integer NOT NULL,
	`summary_line` text,
	`importance_note` text,
	`display_id` text NOT NULL,
	PRIMARY KEY(`pack_id`, `signal_id`),
	FOREIGN KEY (`pack_id`) REFERENCES `packs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`signal_id`) REFERENCES `signals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `packs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slot` text NOT NULL,
	`date` text NOT NULL,
	`generated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`path_to_md` text NOT NULL,
	`signal_count` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending_review' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `packs_date_idx` ON `packs` (`date`);--> statement-breakpoint
CREATE INDEX `packs_status_idx` ON `packs` (`status`);--> statement-breakpoint
CREATE TABLE `review_actions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`review_id` integer NOT NULL,
	`signal_id` integer NOT NULL,
	`action` text NOT NULL,
	`thesis` text,
	`tone` text,
	`must_include` text,
	`must_avoid` text,
	`combine_with` text,
	`reason` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`signal_id`) REFERENCES `signals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `review_actions_review_idx` ON `review_actions` (`review_id`);--> statement-breakpoint
CREATE INDEX `review_actions_signal_idx` ON `review_actions` (`signal_id`);--> statement-breakpoint
CREATE INDEX `review_actions_action_idx` ON `review_actions` (`action`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pack_id` integer NOT NULL,
	`received_at` integer DEFAULT (unixepoch()) NOT NULL,
	`raw_text_path` text NOT NULL,
	`parsed_actions_json` text,
	`interpreter_model` text,
	`interpreter_log_path` text,
	FOREIGN KEY (`pack_id`) REFERENCES `packs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reviews_pack_idx` ON `reviews` (`pack_id`);--> statement-breakpoint
CREATE TABLE `signal_clusters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`theme` text NOT NULL,
	`story_cluster` text,
	`first_seen_at` integer DEFAULT (unixepoch()) NOT NULL,
	`last_seen_at` integer DEFAULT (unixepoch()) NOT NULL,
	`signal_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `signals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_id` integer NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`published_at` integer,
	`fetched_at` integer DEFAULT (unixepoch()) NOT NULL,
	`content_hash` text NOT NULL,
	`dedupe_group` text,
	`cluster_id` integer,
	`status` text DEFAULT 'new' NOT NULL,
	`defer_until` integer,
	`importance` integer,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`cluster_id`) REFERENCES `signal_clusters`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `signals_status_idx` ON `signals` (`status`);--> statement-breakpoint
CREATE INDEX `signals_source_idx` ON `signals` (`source_id`);--> statement-breakpoint
CREATE INDEX `signals_published_idx` ON `signals` (`published_at`);--> statement-breakpoint
CREATE INDEX `signals_hash_idx` ON `signals` (`content_hash`);--> statement-breakpoint
CREATE TABLE `sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`rss_url` text,
	`type` text NOT NULL,
	`language` text DEFAULT 'en' NOT NULL,
	`category` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`authority_score` integer DEFAULT 5 NOT NULL,
	`publishing_frequency` text DEFAULT 'weekly' NOT NULL,
	`last_fetched_at` integer,
	`last_error` text,
	`notes` text,
	`added_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sources_active_idx` ON `sources` (`active`);--> statement-breakpoint
CREATE INDEX `sources_type_idx` ON `sources` (`type`);