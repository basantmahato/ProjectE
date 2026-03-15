"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  getInterviewPrepList,
  type InterviewPrepJobRole,
} from "@/lib/api";

const ICONS = ["code", "groups", "psychology", "business_center"];

export default function InterviewPage() {
  const [roles, setRoles] = useState<InterviewPrepJobRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getInterviewPrepList()
      .then((data) => setRoles(Array.isArray(data) ? data : []))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load interview prep")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout
      title="Interview Prep"
      description="Practice technical, HR, and aptitude questions. Get ready for placements and interviews."
      icon="record_voice_over"
    >
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-[var(--navy-700)]"
            />
          ))}
        </div>
      ) : roles.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400">
          No interview prep categories yet.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role, index) => (
            <Link
              key={role.id}
              href={`/interview/${role.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
                <span className="material-symbols-outlined text-3xl text-[var(--primary)]">
                  {ICONS[index % ICONS.length]}
                </span>
              </div>
              <h2 className="font-bold text-[var(--navy-900)] dark:text-white">
                {role.name ?? "Job role"}
              </h2>
              <p className="mt-1 text-sm font-medium text-[var(--primary)]">
                View topics
              </p>
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
