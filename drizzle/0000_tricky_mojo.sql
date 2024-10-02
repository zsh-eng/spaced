CREATE TABLE `account` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ai_model_usages` (
	`id` text PRIMARY KEY NOT NULL,
	`model` text NOT NULL,
	`prompt_tokens` integer NOT NULL,
	`completion_tokens` integer NOT NULL,
	`total_tokens` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `card_contents` (
	`id` text PRIMARY KEY NOT NULL,
	`card_id` text NOT NULL,
	`question` text DEFAULT '' NOT NULL,
	`answer` text DEFAULT '' NOT NULL,
	`source` text DEFAULT '' NOT NULL,
	`sourceId` text,
	`extend` text,
	`deleted` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cards` (
	`id` text PRIMARY KEY NOT NULL,
	`due` integer DEFAULT (unixepoch()) NOT NULL,
	`stability` real NOT NULL,
	`difficulty` real NOT NULL,
	`elapsed_days` integer NOT NULL,
	`scheduled_days` integer NOT NULL,
	`reps` integer NOT NULL,
	`lapses` integer NOT NULL,
	`state` text NOT NULL,
	`last_review` integer,
	`suspended` integer DEFAULT (unixepoch()) NOT NULL,
	`user_id` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cards_to_decks` (
	`card_id` text NOT NULL,
	`deck_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`card_id`, `deck_id`),
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `decks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`user_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `review_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`card_id` text NOT NULL,
	`grade` text NOT NULL,
	`state` text NOT NULL,
	`due` integer NOT NULL,
	`stability` real NOT NULL,
	`difficulty` real NOT NULL,
	`elapsed_days` integer NOT NULL,
	`last_elapsed_days` integer NOT NULL,
	`scheduled_days` integer NOT NULL,
	`review` integer NOT NULL,
	`duration` integer DEFAULT 0 NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userMedia` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`url` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`emailVerified` integer,
	`image` text,
	`role` text DEFAULT 'basic' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint
CREATE INDEX `ai_model_usage_user_id_indx` ON `ai_model_usages` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `card_contents_card_id_indx` ON `card_contents` (`card_id`);--> statement-breakpoint
CREATE INDEX `cards_user_id_indx` ON `cards` (`user_id`);--> statement-breakpoint
CREATE INDEX `cards_user_id_created_at_indx` ON `cards` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `cards_user_id_difficulty_indx` ON `cards` (`user_id`,`difficulty`);--> statement-breakpoint
CREATE INDEX `decks_user_id_indx` ON `decks` (`user_id`);--> statement-breakpoint
CREATE INDEX `review_logs_card_id_indx` ON `review_logs` (`card_id`);--> statement-breakpoint
CREATE INDEX `review_logs_created_at_indx` ON `review_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `user_media_user_id_indx` ON `userMedia` (`userId`);--> statement-breakpoint
CREATE INDEX `user_media_user_id_created_at_indx` ON `userMedia` (`userId`,`created_at`);