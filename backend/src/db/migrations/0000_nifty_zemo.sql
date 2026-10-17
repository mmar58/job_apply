CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`name` varchar(150) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`description` varchar(255),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` int NOT NULL,
	`role_id` int NOT NULL,
	CONSTRAINT `user_roles_user_id_role_id_pk` PRIMARY KEY(`user_id`,`role_id`)
);
--> statement-breakpoint
CREATE TABLE `permisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`description` varchar(255),
	CONSTRAINT `permisions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permisions_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `role_permision` (
	`role_id` int NOT NULL,
	`permision_id` int NOT NULL,
	CONSTRAINT `role_permision_role_id_permision_id_pk` PRIMARY KEY(`role_id`,`permision_id`)
);
--> statement-breakpoint
CREATE TABLE `candidate_profiles` (
	`id` int NOT NULL,
	`headline` varchar(200),
	`bio` text,
	`phone` varchar(20),
	`address` varchar(255),
	`experience_years` int NOT NULL DEFAULT 0,
	`education` text,
	`experience` text,
	`linkedin_url` varchar(255),
	`github_url` varchar(255),
	`portfolio_url` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidate_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `candidate_skills` (
	`candidate_id` int NOT NULL,
	`skill_id` int NOT NULL,
	CONSTRAINT `candidate_skills_candidate_id_skill_id_pk` PRIMARY KEY(`candidate_id`,`skill_id`)
);
--> statement-breakpoint
CREATE TABLE `job_skills` (
	`job_id` int NOT NULL,
	`skill_id` int NOT NULL,
	CONSTRAINT `job_skills_job_id_skill_id_pk` PRIMARY KEY(`job_id`,`skill_id`)
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(80) NOT NULL,
	`label` varchar(80) NOT NULL,
	CONSTRAINT `skills_id` PRIMARY KEY(`id`),
	CONSTRAINT `skills_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`company` varchar(150) NOT NULL DEFAULT 'AnZ',
	`description` text NOT NULL,
	`requirements` text NOT NULL,
	`location` varchar(150) NOT NULL,
	`job_type` enum('full_time','part_time','contract','internship','remote') NOT NULL DEFAULT 'full_time',
	`experience_level` enum('entry','mid','senior','lead') NOT NULL DEFAULT 'mid',
	`salary_min` int,
	`salary_max` int,
	`status` enum('draft','active','closed') NOT NULL DEFAULT 'draft',
	`deadline` date,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`job_id` int NOT NULL,
	`candidate_id` int NOT NULL,
	`cover_letter` text NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`review_note` text,
	`reviewed_by` int,
	`reviewed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `applications_job_candidate_uq` UNIQUE(`job_id`,`candidate_id`)
);
--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permision` ADD CONSTRAINT `role_permision_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permision` ADD CONSTRAINT `role_permision_permision_id_permisions_id_fk` FOREIGN KEY (`permision_id`) REFERENCES `permisions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `candidate_profiles` ADD CONSTRAINT `candidate_profiles_id_users_id_fk` FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `candidate_skills` ADD CONSTRAINT `candidate_skills_candidate_id_users_id_fk` FOREIGN KEY (`candidate_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `candidate_skills` ADD CONSTRAINT `candidate_skills_skill_id_skills_id_fk` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `job_skills` ADD CONSTRAINT `job_skills_job_id_jobs_id_fk` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `job_skills` ADD CONSTRAINT `job_skills_skill_id_skills_id_fk` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_job_id_jobs_id_fk` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_candidate_id_users_id_fk` FOREIGN KEY (`candidate_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `jobs_status_idx` ON `jobs` (`status`);--> statement-breakpoint
CREATE INDEX `applications_status_idx` ON `applications` (`status`);