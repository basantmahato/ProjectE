"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { getPublishedTest, getPublishedTestBySlug, startAttempt, type Test } from "@/lib/api";

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export default function TestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { isLoggedIn } = useAuth();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchTest = isUuid(slug) ? getPublishedTest(slug) : getPublishedTestBySlug(slug);
    fetchTest
      .then(setTest)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load test"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleStartTest = async () => {
    if (!test || starting) return;
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setStartError(null);
    setStarting(true);
    try {
      const { id: attemptId } = await startAttempt(test.id);
      router.push(`/tests/attempt/${attemptId}`);
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Could not start test. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  if (!slug) {
    return (
      <PageLayout title="Test" icon="quiz">
        <p className="text-slate-600 dark:text-slate-400">Invalid test.</p>
        <Link href="/tests" className="mt-4 text-[var(--primary)] hover:underline">
          Back to Tests
        </Link>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout title="Loading…" icon="quiz">
        <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-[var(--navy-700)]" />
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-[var(--navy-800)]" />
      </PageLayout>
    );
  }

  if (error || !test) {
    return (
      <PageLayout title="Error" icon="quiz">
        <p className="text-red-600 dark:text-red-400">{error || "Test not found."}</p>
        <Link href="/tests" className="mt-4 text-[var(--primary)] hover:underline">
          Back to Tests
        </Link>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={test.title}
      description={test.description ?? undefined}
      icon="quiz"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] sm:p-8">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {test.description ?? "No description."}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {test.durationMinutes != null && (
            <span className="flex items-center gap-1 text-[var(--primary)]">
              <span className="material-symbols-outlined">schedule</span>
              {test.durationMinutes} minutes
            </span>
          )}
          {test.totalMarks != null && (
            <span className="text-slate-600 dark:text-slate-400">
              {test.totalMarks} total marks
            </span>
          )}
        </div>
        {startError && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{startError}</p>
        )}
        {isLoggedIn ? (
          <button
            type="button"
            onClick={handleStartTest}
            disabled={starting}
            className="mt-6 rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {starting ? "Starting…" : "Start test"}
          </button>
        ) : (
          <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
            <Link href="/login" className="font-medium text-[var(--primary)] hover:underline">
              Sign in
            </Link>{" "}
            to start this test.
          </p>
        )}
      </div>
      <Link
        href="/tests"
        className="mt-8 inline-flex items-center gap-2 text-[var(--primary)] hover:underline"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Tests
      </Link>
    </PageLayout>
  );
}
