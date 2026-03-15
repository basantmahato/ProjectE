-- Add slug column (nullable first for backfill)
ALTER TABLE "sample_papers" ADD COLUMN IF NOT EXISTS "slug" text;
--> statement-breakpoint
-- Backfill: slug from title (lowercase, hyphens), append short id for uniqueness
UPDATE "sample_papers" SET "slug" = (
  coalesce(
    nullif(trim(both '-' from lower(regexp_replace(regexp_replace(regexp_replace(coalesce(trim("title"), ''), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'), '-+', '-', 'g'))), ''),
    'untitled'
  ) || '-' || substr(replace("id"::text, '-', ''), 1, 8)
)
WHERE "slug" IS NULL;
--> statement-breakpoint
UPDATE "sample_papers" SET "slug" = 'untitled-' || substr(replace("id"::text, '-', ''), 1, 8) WHERE "slug" IS NULL OR trim("slug") = '';
--> statement-breakpoint
ALTER TABLE "sample_papers" ALTER COLUMN "slug" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "sample_papers" ADD CONSTRAINT "sample_papers_slug_unique" UNIQUE("slug");
