import type { MetadataRoute } from "next";
import { apiServerGetOrNull } from "@/lib/api-server";

function baseUrl(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (typeof process !== "undefined" && process.env?.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://edusaas.com";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blogs`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/notes`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/samplepapers`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tests`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/moctest`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/interview`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/prep`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  const dynamicEntries: MetadataRoute.Sitemap = [];

  try {
    const posts = await apiServerGetOrNull<{ id?: string; slug?: string }[]>(`/blog/posts`);
    if (Array.isArray(posts)) {
      for (const p of posts) {
        const slug = p.slug ?? p.id;
        if (slug) dynamicEntries.push({ url: `${base}/blogs/${slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 });
      }
    }
  } catch {
    // ignore
  }

  try {
    const papers = await apiServerGetOrNull<{ id?: string; slug?: string }[]>(`/sample-papers/list`);
    if (Array.isArray(papers)) {
      for (const p of papers) {
        const slug = p.slug ?? p.id;
        if (slug) dynamicEntries.push({ url: `${base}/samplepapers/${slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 });
      }
    }
  } catch {
    // ignore
  }

  try {
    const tests = await apiServerGetOrNull<{ id?: string; slug?: string }[]>(`/tests/published`);
    if (Array.isArray(tests)) {
      for (const t of tests) {
        const slug = t.slug ?? t.id;
        if (slug) dynamicEntries.push({ url: `${base}/tests/${slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 });
      }
    }
  } catch {
    // ignore
  }

  try {
    const mocks = await apiServerGetOrNull<{ id?: string; slug?: string }[]>(`/mock-tests/published`);
    if (Array.isArray(mocks)) {
      for (const t of mocks) {
        const slug = t.slug ?? t.id;
        if (slug) dynamicEntries.push({ url: `${base}/moctest/${slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 });
      }
    }
  } catch {
    // ignore
  }

  try {
    const roles = await apiServerGetOrNull<{ id?: string }[]>(`/interview-prep/list`);
    if (Array.isArray(roles)) {
      for (const r of roles) {
        if (r.id) dynamicEntries.push({ url: `${base}/interview/${r.id}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 });
      }
    }
  } catch {
    // ignore
  }

  return [...staticEntries, ...dynamicEntries];
}
