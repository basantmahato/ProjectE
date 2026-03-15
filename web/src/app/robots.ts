import type { MetadataRoute } from "next";

function baseUrl(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (typeof process !== "undefined" && process.env?.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://edusaas.com";
}

export default function robots(): MetadataRoute.Robots {
  const base = baseUrl();
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
