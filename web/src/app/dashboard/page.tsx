"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getToken } from "@/lib/auth";
import {
  getDashboardStats,
  getLeaderboard,
  getMyAttempts,
  getCurrentUser,
  getPublishedTests,
  getPublishedMockTests,
  type LeaderboardEntry,
  type Attempt,
} from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setAllowed(true);
  }, [router]);

  const { data: stats, error: statsError, isPending: statsLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => getDashboardStats(),
    enabled: allowed === true,
  });

  const { data: attemptsData, isPending: attemptsLoading } = useQuery({
    queryKey: ["dashboard", "attempts"],
    queryFn: () => getMyAttempts(),
    enabled: allowed === true,
  });

  const { data: leaderboardData } = useQuery({
    queryKey: ["dashboard", "leaderboard"],
    queryFn: () => getLeaderboard(),
    enabled: allowed === true,
  });

  const { data: currentUser } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    enabled: allowed === true,
  });

  const { data: publishedTestsData } = useQuery({
    queryKey: ["tests", "published"],
    queryFn: () => getPublishedTests(),
    enabled: allowed === true,
  });

  const { data: mockTestsData } = useQuery({
    queryKey: ["mock-tests", "published"],
    queryFn: () => getPublishedMockTests(),
    enabled: allowed === true,
  });

  // Normalize to arrays so nothing is ever treated as iterable when it isn't
  const attempts = Array.isArray(attemptsData) ? attemptsData : [];
  const leaderboard = Array.isArray(leaderboardData) ? leaderboardData : [];
  const publishedTests = Array.isArray(publishedTestsData) ? publishedTestsData : [];
  const mockTests = Array.isArray(mockTestsData) ? mockTestsData : [];

  const attemptsCount = attempts.length;
  const loading = statsLoading || attemptsLoading;
  const topThree = leaderboard.slice(0, 3);
  const testIdToTitle = useMemo(() => {
    const map: Record<string, string> = {};
    const testsList = publishedTests;
    const mocksList = mockTests;
    for (const t of testsList) map[t.id] = t.title ?? "Test";
    for (const t of mocksList) map[t.id] = t.title ?? "Mock test";
    return map;
  }, [publishedTests, mockTests]);
  const recentAttempts = useMemo(() => {
    const withDate = (attempts as Attempt[]).map((a) => ({
      ...a,
      sortAt: a.submittedAt ? new Date(a.submittedAt).getTime() : new Date(a.startedAt ?? 0).getTime(),
    }));
    return withDate.sort((a, b) => b.sortAt - a.sortAt).slice(0, 7);
  }, [attempts]);
  const userEntry = currentUser
    ? (leaderboard as LeaderboardEntry[]).find((e) => e.id === currentUser.id)
    : null;
  const userRank = userEntry?.rank ?? null;
  const totalMarks = stats?.totalMarks ?? 0;
  const achievementDefinitions = useMemo(
    () => [
      { id: "beginner", label: "Beginner", icon: "star", requiredPoints: 100, accentClass: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30" },
      { id: "code-master", label: "Code Master", icon: "code", requiredPoints: 250, accentClass: "text-[var(--primary)] bg-[var(--primary)]/15" },
      { id: "top-student", label: "Top Student", icon: "emoji_events", requiredPoints: 500, accentClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30" },
      { id: "team-player", label: "Team Player", icon: "workspace_premium", requiredPoints: 1000, accentClass: "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30" },
    ],
    []
  );
  const achievements = useMemo(
    () =>
      achievementDefinitions.map((def) => ({
        ...def,
        unlocked: !statsLoading && totalMarks >= def.requiredPoints,
      })),
    [achievementDefinitions, totalMarks, statsLoading]
  );
  const error = statsError
    ? statsError instanceof Error
      ? statsError.message
      : "Failed to load stats"
    : null;

  if (allowed !== true) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background-light)] dark:bg-[var(--background-dark)]">
        <div className="text-slate-500 dark:text-slate-400">Loading…</div>
      </div>
    );
  }

  const userStats = [
    {
      label: "Tests taken",
      value: String(attemptsCount),
      icon: "quiz",
      href: "/tests",
    },
    {
      label: "Total marks",
      value: stats ? String(stats.totalMarks) : "—",
      icon: "emoji_events",
      href: "/tests",
    },
    {
      label: "Accuracy",
      value: stats ? `${stats.accuracyPercent}%` : "—",
      icon: "trending_up",
      href: "/tests",
    },
    {
      label: "Mock tests",
      value: stats?.mockTestsTaken != null ? String(stats.mockTestsTaken) : "—",
      icon: "timer",
      href: "/moctest",
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-[var(--background-light)] dark:bg-[var(--background-dark)]">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <header className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-[var(--primary)] sm:text-5xl">
              dashboard
            </span>
            <h1 className="text-2xl font-bold text-[var(--navy-900)] dark:text-white sm:text-3xl md:text-4xl">
              Dashboard
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400 sm:mt-4 sm:text-lg">
            Your learning overview and quick stats.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-[var(--navy-900)] dark:text-white sm:text-xl">
            Your stats
          </h2>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]"
                >
                  <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200 dark:bg-[var(--navy-700)]" />
                  <div className="mt-3 h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-[var(--navy-700)]" />
                  <div className="mt-2 h-4 w-24 animate-pulse rounded bg-slate-100 dark:bg-[var(--navy-800)]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {userStats.map((stat) => (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[var(--primary)]/30 hover:shadow-md dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                      <span className="material-symbols-outlined text-2xl text-[var(--primary)]">
                        {stat.icon}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-2xl font-bold text-[var(--navy-900)] dark:text-white sm:text-3xl">
                        {stat.value}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-[var(--navy-900)] dark:text-white sm:text-xl">
            Achievements
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] sm:p-8">
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
              {achievements.map((item) => {
                const unlocked = item.unlocked;
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col items-center gap-3 ${!unlocked ? "opacity-60" : ""}`}
                  >
                    <div
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full sm:h-20 sm:w-20 ${
                        unlocked ? item.accentClass : "bg-slate-200 text-slate-500 dark:bg-[var(--navy-700)] dark:text-slate-400"
                      }`}
                    >
                      <span className="material-symbols-outlined text-3xl sm:text-4xl">
                        {item.icon}
                      </span>
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-sm font-semibold ${
                          unlocked
                            ? "text-[var(--navy-900)] dark:text-white"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.requiredPoints} pts
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-[var(--navy-900)] dark:text-white sm:text-xl">
            Your progress
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/15">
                  <span className="material-symbols-outlined text-3xl text-[var(--primary)]">
                    trending_up
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[var(--navy-900)] dark:text-white">
                    {attemptsCount} test{attemptsCount !== 1 ? "s" : ""} completed
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {stats ? `${stats.accuracyPercent}% accuracy` : "Take tests to see your accuracy"}
                  </p>
                </div>
              </div>
              <Link
                href="/tests"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--primary)] bg-transparent px-5 py-2.5 font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10"
              >
                View tests
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-[var(--navy-900)] dark:text-white sm:text-xl">
            Recent tests
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]">
            {recentAttempts.length === 0 ? (
              <div className="px-6 py-10 text-center sm:p-8">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
                  quiz
                </span>
                <p className="mt-3 text-slate-600 dark:text-slate-400">
                  No attempts yet. Take a test to see your recent activity here.
                </p>
                <Link
                  href="/tests"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Browse tests
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-[var(--navy-800)]">
                {recentAttempts.map((attempt) => {
                  const title = testIdToTitle[attempt.testId] ?? "Test";
                  const dateStr = attempt.submittedAt
                    ? new Date(attempt.submittedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : attempt.startedAt
                      ? new Date(attempt.startedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        }) + " (in progress)"
                      : "—";
                  const scoreText =
                    attempt.submittedAt != null && attempt.score != null
                      ? `${attempt.score} pts`
                      : attempt.submittedAt
                        ? "Submitted"
                        : "In progress";
                  return (
                    <li key={attempt.id}>
                      <Link
                        href={`/tests/${attempt.testId}`}
                        className="flex flex-wrap items-center gap-3 px-6 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-[var(--navy-800)] sm:gap-4"
                      >
                        <span className="material-symbols-outlined shrink-0 text-slate-400 dark:text-slate-500">
                          assignment
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[var(--navy-900)] dark:text-white">
                            {title}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {dateStr}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-lg px-3 py-1 text-sm font-semibold ${
                            attempt.submittedAt
                              ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                              : "bg-slate-100 text-slate-600 dark:bg-[var(--navy-700)] dark:text-slate-400"
                          }`}
                        >
                          {scoreText}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            {recentAttempts.length > 0 && (
              <div className="border-t border-slate-200 px-6 py-3 dark:border-[var(--navy-800)]">
                <Link
                  href="/tests"
                  className="text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  View all tests →
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-[var(--navy-900)] dark:text-white sm:text-xl">
            Leaderboard
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] sm:p-8">
            <div className="mb-6 flex items-center gap-4 rounded-xl bg-[var(--primary)]/10 px-4 py-3 dark:bg-[var(--primary)]/20">
              <span className="material-symbols-outlined text-2xl text-[var(--primary)]">
                emoji_events
              </span>
              <div>
                <p className="font-semibold text-[var(--navy-900)] dark:text-white">
                  Your rank
                </p>
                <p className="text-2xl font-bold text-[var(--primary)]">
                  {userRank != null ? `#${userRank}` : "—"}
                </p>
              </div>
            </div>
            <p className="mb-4 text-sm font-medium text-slate-600 dark:text-slate-400">
              Top 3
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              {topThree.map((entry, index) => {
                const colors = [
                  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                  "bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200",
                  "bg-amber-200/80 text-amber-800 dark:bg-amber-800/40 dark:text-amber-300",
                ];
                return (
                  <div
                    key={entry.id}
                    className={`flex flex-1 items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-[var(--navy-700)] ${index === 0 ? "border-amber-300/50 dark:border-amber-600/40" : ""}`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${colors[index] ?? colors[0]}`}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[var(--navy-900)] dark:text-white">
                        {entry.name ?? "Anonymous"}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {entry.totalMarks} pts
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {topThree.length === 0 && (
              <p className="py-4 text-center text-slate-500 dark:text-slate-400">
                No leaderboard data yet.
              </p>
            )}
          </div>
        </section>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] sm:p-8">
          <p className="text-slate-600 dark:text-slate-400">
            Use the app to access question bank, mock tests, sample papers, notes,
            and interview prep.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:opacity-90"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
