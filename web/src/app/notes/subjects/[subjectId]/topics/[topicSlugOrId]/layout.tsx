import type { Metadata } from "next";
import { apiServerGetOrNull, isUuid } from "@/lib/api-server";

const DEFAULT_METADATA: Metadata = {
  title: "Notes | EduSaaS",
  description: "Notes for this topic.",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ subjectId: string; topicSlugOrId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subjectId, topicSlugOrId } = await params;
  if (!subjectId || !topicSlugOrId) return DEFAULT_METADATA;
  if (isUuid(topicSlugOrId)) {
    return { title: "Notes | EduSaaS", description: "Notes for this topic." };
  }
  try {
    const topic = await apiServerGetOrNull<{ name?: string }>(
      `/notes/subjects/slug/${encodeURIComponent(subjectId)}/topics/slug/${encodeURIComponent(topicSlugOrId)}`
    );
    if (!topic?.name) return DEFAULT_METADATA;
    return {
      title: `Notes: ${topic.name} | EduSaaS`,
      description: `Notes for ${topic.name}.`,
    };
  } catch {
    return DEFAULT_METADATA;
  }
}

export default function TopicSlugLayout({ children }: Props) {
  return <>{children}</>;
}
