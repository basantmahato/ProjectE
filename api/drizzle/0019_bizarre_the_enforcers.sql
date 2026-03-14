ALTER TABLE "test_attempts" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD COLUMN "device_id" varchar(255);