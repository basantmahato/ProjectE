/**
 * Converts a title to a URL-friendly slug: lowercase, hyphens, no special chars.
 * e.g. "JEE Main 2025 Sample" → "jee-main-2025-sample"
 */
export function slugify(title: string): string {
  if (!title || typeof title !== 'string') return '';
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, '') // remove non-letters, non-numbers (keep unicode letters/numbers)
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') // collapse multiple hyphens
      .replace(/^-|-$/g, '') || // trim leading/trailing hyphens
    'untitled'
  );
}

/**
 * Returns a slug that is unique according to checkExists. Appends -2, -3, ... if needed.
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let slug = baseSlug;
  let n = 2;
  while (await checkExists(slug)) {
    slug = `${baseSlug}-${n}`;
    n += 1;
  }
  return slug;
}
