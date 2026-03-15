/**
 * Returns the first word of a name string, or fallback if empty.
 * Used for display names across the app (e.g. "John Doe" → "John").
 */
export function getFirstWord(
  value: string | null | undefined,
  fallback: string = 'User'
): string {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return fallback;
  const first = trimmed.split(/\s+/)[0];
  return first || fallback;
}
