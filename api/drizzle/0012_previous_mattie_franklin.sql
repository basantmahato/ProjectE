CREATE TABLE "sample_papers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sample_paper_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sample_paper_topic_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"explanation" text,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sample_paper_question_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sample_paper_question_id" uuid NOT NULL,
	"option_text" text NOT NULL,
	"is_correct" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "sample_paper_subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sample_paper_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sample_paper_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sample_paper_subject_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "sample_paper_questions" ADD CONSTRAINT "sample_paper_questions_sample_paper_topic_id_sample_paper_topics_id_fk" FOREIGN KEY ("sample_paper_topic_id") REFERENCES "public"."sample_paper_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sample_paper_question_options" ADD CONSTRAINT "sample_paper_question_options_sample_paper_question_id_sample_paper_questions_id_fk" FOREIGN KEY ("sample_paper_question_id") REFERENCES "public"."sample_paper_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sample_paper_subjects" ADD CONSTRAINT "sample_paper_subjects_sample_paper_id_sample_papers_id_fk" FOREIGN KEY ("sample_paper_id") REFERENCES "public"."sample_papers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sample_paper_topics" ADD CONSTRAINT "sample_paper_topics_sample_paper_subject_id_sample_paper_subjects_id_fk" FOREIGN KEY ("sample_paper_subject_id") REFERENCES "public"."sample_paper_subjects"("id") ON DELETE cascade ON UPDATE no action;