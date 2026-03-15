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
      ? `/notes/notes/${slug}`
      : `/notes/notes/slug/${encodeURIComponent(slug)}`;
    const note = await apiServerGetOrNull<{ title?: string; content?: string }>(path);
    if (!note) return DEFAULT_METADATA;
    const title = note.title ?? "Note";
    const description =
      typeof note.content === "string" ? note.content.slice(0, 160) : "Note";
    return {
      title: `${title} | EduSaaS`,
      description: description,
    };
  } catch {
    return DEFAULT_METADATA;
  }
}

export default function NoteViewSlugLayout({ children }: Props) {
  return <>{children}</>;
}
