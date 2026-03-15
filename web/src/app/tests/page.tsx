"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { getPublishedTests, getUpcomingTests, type Test } from "@/lib/api";

export default function TestsPage() {
  const [published, setPublished] = useState<Test[]>([]);
  const [upcoming, setUpcoming] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getPublishedTests(), getUpcomingTests()])
      .then(([p, u]) => {
        setPublished(Array.isArray(p) ? p : []);
        setUpcoming(Array.isArray(u) ? u : []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load tests"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout
      title="Tests"
      description="Take subject-wise, full syllabus, and timed tests. Track your progress and improve."
      icon="quiz"
    >
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl bg-slate-200 dark:bg-[var(--navy-700)]"
            />
          ))}
        </div>
      ) : (
        <>
          {published.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 text-lg font-bold text-[var(--navy-900)] dark:text-white">
                Published tests
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {published.map((test) => (
                  <Link
                    key={test.id}
                    href={`/tests/${test.slug ?? test.id}`}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[var(--primary)]/30 hover:shadow-lg dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]"
                  >
                    <h3 className="font-bold text-[var(--navy-900)] dark:text-white">
                      {test.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {test.description ?? "No description."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--primary)]">
                      {test.durationMinutes != null && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {test.durationMinutes} min
                        </span>
                      )}
                      {test.totalMarks != null && (
                        <span>{test.totalMarks} marks</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold text-[var(--navy-900)] dark:text-white">
                Upcoming tests
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((test) => (
                  <div
                    key={test.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]"
                  >
                    <h3 className="font-bold text-[var(--navy-900)] dark:text-white">
                      {test.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {test.description ?? "No description."}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Starts {test.scheduledAt ? new Date(test.scheduledAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {!loading && published.length === 0 && upcoming.length === 0 && (
            <p className="text-slate-600 dark:text-slate-400">No tests available yet.</p>
          )}
        </>
      )}
    </PageLayout>
  );
}
