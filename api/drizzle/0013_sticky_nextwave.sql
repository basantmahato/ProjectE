CREATE TABLE "interview_prep_job_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "interview_prep_subtopics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" uuid NOT NULL,
	"name" text NOT NULL,
	"explanation" text,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "interview_prep_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_role_id" uuid NOT NULL,
	"name" text NOT NULL,
	"explanation" text,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "interview_prep_subtopics" ADD CONSTRAINT "interview_prep_subtopics_topic_id_interview_prep_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."interview_prep_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_prep_topics" ADD CONSTRAINT "interview_prep_topics_job_role_id_interview_prep_job_roles_id_fk" FOREIGN KEY ("job_role_id") REFERENCES "public"."interview_prep_job_roles"("id") ON DELETE cascade ON UPDATE no action;