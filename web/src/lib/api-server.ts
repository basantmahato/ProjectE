/**
 * Server-only API helper for use in generateMetadata, server components, sitemap, etc.
 * Uses absolute backend URL (no browser auth or localStorage).
 * For sample paper read, sends X-Device-ID so the backend accepts the request (may count as guest view unless backend skips tracking).
 */

const BASE_URL =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : process.env?.API_PROXY_TARGET || "http://localhost:8000";

function getErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "message" in data) {
    const msg = (data as { message: unknown }).message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg)) return msg[0] ?? fallback;
  }
  return fallback;
}

export async function apiServerGet<T>(
  path: string,
  options?: { headers?: Record<string, string> }
): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers,
  };
  const res = await fetch(url, { method: "GET", headers, next: { revalidate: 60 } });
  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    throw new Error(getErrorMessage(data, "Request failed"));
  }
  return data as T;
}

/** Same as apiServerGet but returns null on 404/error instead of throwing (for generateMetadata fallback). */
export async function apiServerGetOrNull<T>(
  path: string,
  options?: { headers?: Record<string, string> }
): Promise<T | null> {
  try {
    return await apiServerGet<T>(path, options);
  } catch {
    return null;
  }
}

/** Headers to send for sample paper read so backend accepts the request without a real user/device. */
export const SAMPLE_PAPER_SSR_HEADERS = {
  "X-Device-ID": "ssr-crawler",
} as const;

export function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
