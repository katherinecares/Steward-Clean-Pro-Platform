CREATE TABLE `auditCriteria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`weight` int NOT NULL DEFAULT 1,
	`order` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditCriteria_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`auditId` int NOT NULL,
	`criteriaId` int NOT NULL,
	`status` enum('pass','fail','pending') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auditResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`auditorId` int,
	`overallScore` int NOT NULL DEFAULT 0,
	`status` enum('draft','in_progress','completed') NOT NULL DEFAULT 'draft',
	`completedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `audits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `certificationLevels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`slug` varchar(50) NOT NULL,
	`description` text,
	`requiredScore` int NOT NULL,
	`benefits` text,
	`color` varchar(20),
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certificationLevels_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificationLevels_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `environmentalImpact` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`co2Saved` int NOT NULL DEFAULT 0,
	`waterSaved` int NOT NULL DEFAULT 0,
	`wasteReduced` int NOT NULL DEFAULT 0,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `environmentalImpact_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`location` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`photoUrl` varchar(500),
	`status` enum('open','in_progress','resolved') NOT NULL DEFAULT 'open',
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`resolvedAt` timestamp,
	CONSTRAINT `incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`sku` varchar(100) NOT NULL,
	`categoryId` int NOT NULL,
	`description` text,
	`certifications` text,
	`imageUrl` varchar(500),
	`unit` varchar(50),
	`price` int NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	`minStock` int NOT NULL DEFAULT 10,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `restockOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int NOT NULL,
	`quantity` int NOT NULL,
	`status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
	`predictedDate` timestamp,
	`confirmedDate` timestamp,
	`completedDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `restockOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stockMovements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('in','out','adjustment') NOT NULL,
	`quantity` int NOT NULL,
	`previousStock` int NOT NULL,
	`newStock` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stockMovements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userCertifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`levelId` int NOT NULL,
	`currentScore` int NOT NULL DEFAULT 0,
	`progress` int NOT NULL DEFAULT 0,
	`achievedAt` timestamp,
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userCertifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsappNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('stock_alert','restock_recommendation','incident_alert','certification_update') NOT NULL,
	`message` text NOT NULL,
	`productId` int,
	`incidentId` int,
	`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsappNotifications_id` PRIMARY KEY(`id`)
);
