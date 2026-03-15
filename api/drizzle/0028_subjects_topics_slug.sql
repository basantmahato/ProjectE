-- Subjects: add slug (nullable then backfill then NOT NULL UNIQUE)
ALTER TABLE "subjects" ADD COLUMN IF NOT EXISTS "slug" text;
--> statement-breakpoint
UPDATE "subjects" SET "slug" = (
  coalesce(
    nullif(trim(both '-' from lower(regexp_replace(regexp_replace(regexp_replace(coalesce(trim("name"), ''), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'), '-+', '-', 'g'))), ''),
    'subject'
  ) || '-' || substr(replace("id"::text, '-', ''), 1, 8)
)
WHERE "slug" IS NULL;
--> statement-breakpoint
UPDATE "subjects" SET "slug" = 'subject-' || substr(replace("id"::text, '-', ''), 1, 8) WHERE "slug" IS NULL OR trim("slug") = '';
--> statement-breakpoint
ALTER TABLE "subjects" ALTER COLUMN "slug" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_slug_unique" UNIQUE("slug");

--> statement-breakpoint
-- Topics: add slug (nullable then backfill then NOT NULL and unique per subject)
ALTER TABLE "topics" ADD COLUMN IF NOT EXISTS "slug" text;
--> statement-breakpoint
UPDATE "topics" SET "slug" = (
  coalesce(
    nullif(trim(both '-' from lower(regexp_replace(regexp_replace(regexp_replace(coalesce(trim("name"), ''), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'), '-+', '-', 'g'))), ''),
    'topic'
  ) || '-' || substr(replace("id"::text, '-', ''), 1, 8)
)
WHERE "slug" IS NULL;
--> statement-breakpoint
UPDATE "topics" SET "slug" = 'topic-' || substr(replace("id"::text, '-', ''), 1, 8) WHERE "slug" IS NULL OR trim("slug") = '';
--> statement-breakpoint
ALTER TABLE "topics" ALTER COLUMN "slug" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_subject_slug_unique" UNIQUE("subject_id", "slug");
