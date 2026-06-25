CREATE TABLE `analysis_records` (
	`id` varchar(21) NOT NULL,
	`pair` text NOT NULL,
	`timeframe` text NOT NULL,
	`date` text NOT NULL,
	`indicators` json NOT NULL,
	`verdict` json NOT NULL,
	`chart_image` text,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `analysis_records_id` PRIMARY KEY(`id`)
);
