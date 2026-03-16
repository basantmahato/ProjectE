"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { useSubjectTopics, useSubjectTopicsBySlug } from "@/hooks/queries";

const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export default function SubjectTopicsPage() {
  const params = useParams();
  const subjectParam = typeof params.subjectId === "string" ? params.subjectId : "";
  const byId = useSubjectTopics(isUuid(subjectParam) ? subjectParam : "");
  const bySlug = useSubjectTopicsBySlug(!isUuid(subjectParam) ? subjectParam : "");
  const query = isUuid(subjectParam) ? byId : bySlug;
  const topics = Array.isArray(query.data) ? query.data : [];
  const loading = query.isPending;
  const error = query.error ? (query.error instanceof Error ? query.error.message : "Failed to load topics") : null;

  if (!subjectParam) {
    return (
      <PageLayout title="Topics" icon="menu_book">
        <p className="text-slate-600 dark:text-slate-400">Invalid subject.</p>
        <Link href="/notes" className="mt-4 text-[var(--primary)] hover:underline">
          Back to Notes
        </Link>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Topics"
      description="Select a topic to view notes."
      icon="menu_book"
    >
      <Link
        href="/notes"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Notes
      </Link>
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl bg-slate-200 dark:bg-[var(--navy-700)]"
            />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400">No topics in this subject.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/notes/subjects/${subjectParam}/topics/${topic.slug ?? topic.id}`}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                <span className="material-symbols-outlined text-xl text-[var(--primary)]">
                  description
                </span>
              </div>
              <span className="font-medium text-[var(--navy-900)] dark:text-white">
                {topic.name ?? "Topic"}
              </span>
              <span className="material-symbols-outlined shrink-0 text-slate-400">
                chevron_right
              </span>
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
