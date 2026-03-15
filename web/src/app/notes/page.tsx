"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { getNoteSubjects, type Subject } from "@/lib/api";

const ICONS: Record<string, string> = {
  Mathematics: "calculate",
  Physics: "science",
  Chemistry: "biotech",
  "Computer Science": "code",
  English: "menu_book",
};

export default function NotesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getNoteSubjects()
      .then(setSubjects)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load subjects"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout
      title="Notes"
      description="Structured notes by subject and topic. Revise concepts and prepare for exams."
      icon="menu_book"
    >
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]"
            >
              <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-200 dark:bg-[var(--navy-700)]" />
              <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-[var(--navy-700)]" />
            </div>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400">No subjects yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/notes/subjects/${subject.slug ?? subject.id}`}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                <span className="material-symbols-outlined text-2xl text-[var(--primary)]">
                  {ICONS[subject.name ?? ""] ?? "menu_book"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-[var(--navy-900)] dark:text-white">
                  {subject.name ?? "Subject"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  View topics
                </p>
              </div>
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
