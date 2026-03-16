"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { useSamplePaper } from "@/hooks/queries";
import type {
  SamplePaperSubject,
  SamplePaperTopic,
  SamplePaperQuestion,
} from "@/lib/api";

export default function SamplePaperDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { data: paper, isPending: loading, error: queryError } = useSamplePaper(slug);
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load sample paper") : null;

  if (!slug) {
    return (
      <PageLayout title="Sample Paper" icon="description">
        <p className="text-slate-600 dark:text-slate-400">Invalid paper.</p>
        <Link href="/samplepapers" className="mt-4 text-[var(--primary)] hover:underline">
          Back to Sample Papers
        </Link>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout title="Loading…" icon="description">
        <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-[var(--navy-700)]" />
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-[var(--navy-800)]" />
      </PageLayout>
    );
  }

  if (error || !paper) {
    return (
      <PageLayout title="Error" icon="description">
        <p className="text-red-600 dark:text-red-400">
          {error || "Sample paper not found."}
        </p>
        <Link href="/samplepapers" className="mt-4 text-[var(--primary)] hover:underline">
          Back to Sample Papers
        </Link>
      </PageLayout>
    );
  }

  const subjects = Array.isArray(paper.subjects) ? paper.subjects : [];
  return (
    <PageLayout
      title={paper.title ?? "Sample Paper"}
      description={paper.description ?? undefined}
      icon="description"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] sm:p-8">
        {paper.description && (
          <p className="text-slate-600 dark:text-slate-400">{paper.description}</p>
        )}
        {subjects.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No sections in this paper yet.</p>
        ) : (
          <div className="mt-8 space-y-10">
            {subjects.map((subject: SamplePaperSubject) => (
              <section key={subject.id}>
                <h2 className="mb-4 text-xl font-bold text-[var(--navy-900)] dark:text-white">
                  {subject.name}
                </h2>
                <div className="space-y-8">
                  {(subject.topics ?? []).map((topic: SamplePaperTopic) => (
                    <div key={topic.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-[var(--navy-800)] dark:bg-[var(--navy-800)]/30">
                      <h3 className="mb-3 text-lg font-semibold text-[var(--navy-800)] dark:text-slate-200">
                        {topic.name}
                      </h3>
                      <ul className="space-y-5">
                        {(topic.questions ?? []).map((q: SamplePaperQuestion, idx: number) => (
                          <li
                            key={q.id}
                            className="rounded-lg border border-slate-100 bg-white p-4 dark:border-[var(--navy-700)] dark:bg-[var(--navy-900)]"
                          >
                            <p className="font-medium text-[var(--navy-900)] dark:text-white">
                              {idx + 1}. {q.questionText}
                            </p>
                            <ul className="mt-2 ml-4 list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
                              {(q.options ?? []).map((opt) => (
                                <li
                                  key={opt.id}
                                  className={opt.isCorrect ? "font-medium text-[var(--primary)]" : ""}
                                >
                                  {opt.optionText}
                                  {opt.isCorrect && " ✓"}
                                </li>
                              ))}
                            </ul>
                            {q.explanation && (
                              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                                <span className="font-medium">Explanation:</span> {q.explanation}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
      <Link
        href="/samplepapers"
        className="mt-8 inline-flex items-center gap-2 text-[var(--primary)] hover:underline"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Sample Papers
      </Link>
    </PageLayout>
  );
}
