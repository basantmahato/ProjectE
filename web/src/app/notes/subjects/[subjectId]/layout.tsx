import type { Metadata } from "next";
import { apiServerGetOrNull, isUuid } from "@/lib/api-server";

const DEFAULT_METADATA: Metadata = {
  title: "Topics | EduSaaS",
  description: "Notes by topic.",
};

type Props = { children: React.ReactNode; params: Promise<{ subjectId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subjectId } = await params;
  if (!subjectId) return DEFAULT_METADATA;
  if (isUuid(subjectId)) {
    return { title: "Topics | EduSaaS", description: "Notes by topic." };
  }
  try {
    const subject = await apiServerGetOrNull<{ name?: string }>(
      `/notes/subjects/slug/${encodeURIComponent(subjectId)}`
    );
    if (!subject?.name) return DEFAULT_METADATA;
    return {
      title: `Topics: ${subject.name} | EduSaaS`,
      description: "Notes by topic.",
    };
  } catch {
    return DEFAULT_METADATA;
  }
}

export default function SubjectIdLayout({ children }: Props) {
  return <>{children}</>;
}
