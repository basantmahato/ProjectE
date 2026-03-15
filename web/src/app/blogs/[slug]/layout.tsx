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
      ? `/blog/posts/${slug}`
      : `/blog/posts/slug/${encodeURIComponent(slug)}`;
    const post = await apiServerGetOrNull<{ title?: string; excerpt?: string; content?: string }>(
      path
    );
    if (!post?.title) return DEFAULT_METADATA;
    const description =
      post.excerpt ?? (typeof post.content === "string" ? post.content.slice(0, 160) : undefined);
    return {
      title: `${post.title} | EduSaaS`,
      description: description ?? "Blog post.",
    };
  } catch {
    return DEFAULT_METADATA;
  }
}

export default function BlogSlugLayout({ children }: Props) {
  return <>{children}</>;
}
