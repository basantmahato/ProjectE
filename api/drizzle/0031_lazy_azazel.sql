ALTER TABLE "tests" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_slug_unique" UNIQUE("slug");