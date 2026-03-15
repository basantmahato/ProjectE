"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  getNotifications,
  markNotificationRead,
  type Notification,
} from "@/lib/api";

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    getNotifications()
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load notifications")
      )
      .finally(() => setLoading(false));
  }, [router]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setList((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // ignore
    }
  };

  if (!getToken()) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background-light)] dark:bg-[var(--background-dark)]">
        <div className="text-slate-500 dark:text-slate-400">Redirecting…</div>
      </div>
    );
  }

  return (
    <PageLayout
      title="Notifications"
      description="Your notifications and updates."
      icon="notifications"
    >
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-[var(--navy-700)]"
            />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400">
          You have no notifications.
        </p>
      ) : (
        <ul className="space-y-4">
          {list.map((n) => (
            <li
              key={n.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm dark:bg-[var(--navy-900)] ${
                n.read
                  ? "border-slate-200 dark:border-[var(--navy-800)] opacity-80"
                  : "border-[var(--primary)]/20 dark:border-[var(--primary)]/20"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-[var(--navy-900)] dark:text-white">
                    {n.title}
                  </h3>
                  {n.body && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {n.body}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(n.id)}
                    className="shrink-0 rounded-lg border border-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/10"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageLayout>
  );
}
