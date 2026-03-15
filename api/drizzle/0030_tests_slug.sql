-- Add slug to tests (nullable then backfill then NOT NULL UNIQUE)
ALTER TABLE "tests" ADD COLUMN IF NOT EXISTS "slug" text;
--> statement-breakpoint
UPDATE "tests" SET "slug" = (
  coalesce(
    nullif(trim(both '-' from lower(regexp_replace(regexp_replace(regexp_replace(coalesce(trim("title"), ''), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'), '-+', '-', 'g'))), ''),
    'test'
  ) || '-' || substr(replace("id"::text, '-', ''), 1, 8)
)
WHERE "slug" IS NULL;
--> statement-breakpoint
UPDATE "tests" SET "slug" = 'test-' || substr(replace("id"::text, '-', ''), 1, 8) WHERE "slug" IS NULL OR trim("slug") = '';
--> statement-breakpoint
ALTER TABLE "tests" ALTER COLUMN "slug" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_slug_unique" UNIQUE("slug");
