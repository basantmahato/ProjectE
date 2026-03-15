-- Add slug column (nullable first for backfill)
ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "slug" text;
--> statement-breakpoint
-- Backfill: slug from title (lowercase, hyphens), append short id for uniqueness
UPDATE "notes" SET "slug" = (
  coalesce(
    nullif(trim(both '-' from lower(regexp_replace(regexp_replace(regexp_replace(coalesce(trim("title"), ''), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'), '-+', '-', 'g'))), ''),
    'untitled'
  ) || '-' || substr(replace("id"::text, '-', ''), 1, 8)
)
WHERE "slug" IS NULL;
--> statement-breakpoint
UPDATE "notes" SET "slug" = 'untitled-' || substr(replace("id"::text, '-', ''), 1, 8) WHERE "slug" IS NULL OR trim("slug") = '';
--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "slug" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_slug_unique" UNIQUE("slug");
