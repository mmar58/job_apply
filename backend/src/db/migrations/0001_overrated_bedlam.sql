ALTER TABLE `candidate_profiles` RENAME COLUMN `id` TO `user_id`;--> statement-breakpoint
ALTER TABLE `candidate_profiles` DROP FOREIGN KEY `candidate_profiles_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `candidate_profiles` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `candidate_profiles` ADD PRIMARY KEY(`user_id`);--> statement-breakpoint
ALTER TABLE `candidate_profiles` ADD CONSTRAINT `candidate_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;