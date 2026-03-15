"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { getInterviewPrepRole } from "@/lib/api";

export default function InterviewRolePage() {
  const params = useParams();
  const roleId = typeof params.roleId === "string" ? params.roleId : "";
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planRequired, setPlanRequired] = useState(false);

  useEffect(() => {
    if (!roleId) return;
    getInterviewPrepRole(roleId)
      .then(setData)
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to load";
        setError(msg);
        setPlanRequired(
          msg.includes("Upgrade") ||
            msg.includes("plan") ||
            msg.includes("PLAN_UPGRADE")
        );
      })
      .finally(() => setLoading(false));
  }, [roleId]);

  if (!roleId) {
    return (
      <PageLayout title="Interview Prep" icon="record_voice_over">
        <p className="text-slate-600 dark:text-slate-400">Invalid role.</p>
        <Link href="/interview" className="mt-4 text-[var(--primary)] hover:underline">
          Back to Interview Prep
        </Link>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout title="Loading…" icon="record_voice_over">
        <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-[var(--navy-700)]" />
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-[var(--navy-800)]" />
      </PageLayout>
    );
  }

  if (planRequired) {
    return (
      <PageLayout title="Upgrade required" icon="record_voice_over">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-amber-800 dark:text-amber-200">
            Interview prep content requires Basic or Premium plan. Upgrade your plan to access.
          </p>
        </div>
        <Link
          href="/interview"
          className="mt-8 inline-flex items-center gap-2 text-[var(--primary)] hover:underline"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Interview Prep
        </Link>
      </PageLayout>
    );
  }

  if (error && !data) {
    return (
      <PageLayout title="Error" icon="record_voice_over">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Link href="/interview" className="mt-4 text-[var(--primary)] hover:underline">
          Back to Interview Prep
        </Link>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Interview Prep" icon="record_voice_over">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] sm:p-8">
        <p className="text-slate-600 dark:text-slate-400">
          Content loaded from API. Full topic tree can be rendered here.
        </p>
      </div>
      <Link
        href="/interview"
        className="mt-8 inline-flex items-center gap-2 text-[var(--primary)] hover:underline"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Interview Prep
      </Link>
    </PageLayout>
  );
}
