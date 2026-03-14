CREATE TABLE "sample_paper_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"sample_paper_id" uuid NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sample_paper_views" ADD CONSTRAINT "sample_paper_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sample_paper_views" ADD CONSTRAINT "sample_paper_views_sample_paper_id_sample_papers_id_fk" FOREIGN KEY ("sample_paper_id") REFERENCES "public"."sample_papers"("id") ON DELETE cascade ON UPDATE no action;