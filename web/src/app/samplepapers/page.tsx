"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  getSamplePapersList,
  type SamplePaperListItem,
} from "@/lib/api";

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

export default function SamplepapersPage() {
  const [papers, setPapers] = useState<SamplePaperListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSamplePapersList()
      .then((data) => setPapers(Array.isArray(data) ? data : []))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load sample papers")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout
      title="Sample Papers"
      description="Previous years' sample papers and model papers for exam practice."
      icon="description"
    >
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-[var(--navy-700)]"
            />
          ))}
        </div>
      ) : papers.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400">
          No sample papers available yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {papers.map((paper) => (
            <div
              key={paper.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-[var(--navy-900)] dark:text-white">
                  {paper.title}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {(paper.description ?? formatDate(paper.createdAt)) || "Sample paper"}
                </p>
              </div>
              <Link
                href={`/samplepapers/${paper.slug ?? paper.id}`}
                className="mt-3 flex items-center gap-2 sm:mt-0 text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                <span className="material-symbols-outlined">visibility</span>
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
