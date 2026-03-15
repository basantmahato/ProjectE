ALTER TABLE "subjects" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_subject_slug_unique" UNIQUE("subject_id","slug");