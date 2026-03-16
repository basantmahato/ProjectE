"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { markNotificationRead } from "@/lib/api";
import {
  registerWebPush,
  isPushSupported,
  getNotificationPermission,
} from "@/lib/webPush";
import { useNotificationsInfinite } from "@/hooks/queries";
import { useRequireAuth } from "@/hooks/useRequireAuth";

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
  const { isReady } = useRequireAuth();
  const queryClient = useQueryClient();
  const {
    data,
    isPending: loading,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotificationsInfinite();
  const list = data?.pages?.flatMap((p) => (Array.isArray(p?.data) ? p.data : [])) ?? [];
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load notifications") : null;
  const [pushEnabling, setPushEnabling] = useState(false);
  const [pushMessage, setPushMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | null>(null);
  const pushSupported = isPushSupported();

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushPermission(getNotificationPermission());
    }
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {
      // ignore
    }
  };

  const handleEnablePush = async () => {
    setPushMessage(null);
    setPushEnabling(true);
    const result = await registerWebPush();
    setPushEnabling(false);
    if (result.ok) {
      setPushMessage({ type: "success", text: "Browser notifications enabled." });
      setPushPermission("granted");
    } else {
      setPushMessage({ type: "error", text: result.error });
    }
  };

  if (!isReady) {
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
      {pushMessage && (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm ${
            pushMessage.type === "success"
              ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {pushMessage.text}
        </div>
      )}
      {pushSupported && pushPermission !== "granted" && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[var(--navy-700)] dark:bg-[var(--navy-800)]">
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
            Get notified in your browser when new notifications are sent.
          </p>
          <button
            type="button"
            onClick={handleEnablePush}
            disabled={pushEnabling}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {pushEnabling ? "Enabling…" : "Enable browser notifications"}
          </button>
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
        <>
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
          {hasNextPage && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="rounded-xl border border-[var(--primary)] bg-transparent px-6 py-2.5 font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10 disabled:opacity-50"
              >
                {isFetchingNextPage ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
