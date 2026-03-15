import type { Metadata } from "next";
import {
  apiServerGetOrNull,
  isUuid,
  SAMPLE_PAPER_SSR_HEADERS,
} from "@/lib/api-server";

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
      ? `/sample-papers/read/${slug}`
      : `/sample-papers/read/slug/${encodeURIComponent(slug)}`;
    const paper = await apiServerGetOrNull<{ title?: string; description?: string }>(path, {
      headers: SAMPLE_PAPER_SSR_HEADERS,
    });
    if (!paper?.title) return DEFAULT_METADATA;
    return {
      title: `${paper.title} | EduSaaS`,
      description: paper.description ?? "Sample paper.",
    };
  } catch {
    return DEFAULT_METADATA;
  }
}

export default function SamplePaperSlugLayout({ children }: Props) {
  return <>{children}</>;
}
