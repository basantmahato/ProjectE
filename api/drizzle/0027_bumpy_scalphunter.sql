ALTER TABLE "notes" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sample_papers" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "sample_papers" ADD CONSTRAINT "sample_papers_slug_unique" UNIQUE("slug");