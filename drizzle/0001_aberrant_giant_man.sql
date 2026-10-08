CREATE INDEX `requests_email_created` ON `requests` (`email`,`created_at`);--> statement-breakpoint
CREATE INDEX `requests_created` ON `requests` (`created_at`);