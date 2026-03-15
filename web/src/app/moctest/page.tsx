"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { getPublishedMockTests, type Test } from "@/lib/api";

export default function MoctestPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPublishedMockTests()
      .then((data) => setTests(Array.isArray(data) ? data : []))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load mock tests"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout
      title="Mock Tests"
      description="Full-length mock tests with timers. Simulate real exam conditions and track your score."
      icon="timer"
    >
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl bg-slate-200 dark:bg-[var(--navy-700)]"
            />
          ))}
        </div>
      ) : tests.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400">No mock tests available yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[var(--primary)]/30 hover:shadow-md dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]"
            >
              <h2 className="font-bold text-[var(--navy-900)] dark:text-white">
                {test.title}
              </h2>
              <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                {test.durationMinutes != null && (
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-[var(--primary)]">
                      schedule
                    </span>
                    {test.durationMinutes} min
                  </li>
                )}
                {test.totalMarks != null && (
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-[var(--primary)]">
                      help
                    </span>
                    {test.totalMarks} marks
                  </li>
                )}
              </ul>
              <Link
                href={`/moctest/${test.slug ?? test.id}`}
                className="mt-4 block w-full rounded-xl bg-[var(--primary)] py-2.5 text-center text-sm font-bold text-white transition-all hover:opacity-90"
              >
                Start test
              </Link>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
