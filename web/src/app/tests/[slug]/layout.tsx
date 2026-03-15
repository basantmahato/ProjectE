import type { Metadata } from "next";
import { apiServerGetOrNull, isUuid } from "@/lib/api-server";

const DEFAULT_METADATA: Metadata = {
  title: "EduSaaS",
  description: "Exam prep platform.",
};

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) return DEFAULT_METADATA;
  try {
    const path = isUuid(slug)
      ? `/tests/published/${slug}`
      : `/tests/published/slug/${encodeURIComponent(slug)}`;
    const test = await apiServerGetOrNull<{ title?: string; description?: string }>(path);
    if (!test?.title) return DEFAULT_METADATA;
    return {
      title: `${test.title} | EduSaaS`,
      description: test.description ?? "Practice test.",
    };
  } catch {
    return DEFAULT_METADATA;
  }
}

export default function TestSlugLayout({ children }: Props) {
  return <>{children}</>;
}
