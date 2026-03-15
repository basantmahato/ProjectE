import type { Metadata } from "next";
import { apiServerGetOrNull } from "@/lib/api-server";

const DEFAULT_METADATA: Metadata = {
  title: "Interview Prep | EduSaaS",
  description: "Interview preparation.",
};

type Props = { children: React.ReactNode; params: Promise<{ roleId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { roleId } = await params;
  if (!roleId) return DEFAULT_METADATA;
  try {
    const role = await apiServerGetOrNull<{ name?: string }>(
      `/interview-prep/read/${roleId}`
    );
    if (!role?.name) return DEFAULT_METADATA;
    return {
      title: `Interview: ${role.name} | EduSaaS`,
      description: `Interview prep for ${role.name}.`,
    };
  } catch {
    return DEFAULT_METADATA;
  }
}

export default function InterviewRoleLayout({ children }: Props) {
  return <>{children}</>;
}
