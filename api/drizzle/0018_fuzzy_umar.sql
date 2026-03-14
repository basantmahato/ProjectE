ALTER TABLE "sample_paper_views" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_paper_views" ADD COLUMN "device_id" varchar(255);