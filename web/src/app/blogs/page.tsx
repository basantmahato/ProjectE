"use client";

import Link from "next/link";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useBlogPostsPaginated } from "@/hooks/queries";

const POSTS_PER_PAGE = 9;

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function BlogsPage() {
  const [page, setPage] = useState(1);
  const { data: result, isPending: loading, error: queryError } = useBlogPostsPaginated(page, POSTS_PER_PAGE);
  const posts = result?.data ?? [];
  const totalPages = result?.totalPages ?? 1;
  const total = result?.total ?? 0;
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load posts") : null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <PageLayout
      title="Blog"
      description="Articles, tips, and updates to support your learning journey."
      icon="article"
    >
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]"
            >
              <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-[var(--navy-700)]" />
              <div className="mt-3 h-6 w-full animate-pulse rounded bg-slate-200 dark:bg-[var(--navy-700)]" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-[var(--navy-800)]" />
            </div>
          ))}
        </div>
      ) : (posts ?? []).length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400">No posts yet.</p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(posts ?? []).map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--primary)]">
                  {formatDate(post.publishedAt)}
                </p>
                <h2 className="mt-2 text-lg font-bold text-[var(--navy-900)] dark:text-white sm:text-xl">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
                  {post.excerpt || "No excerpt."}
                </p>
                <Link
                  href={`/blogs/${post.slug ?? post.id}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline"
                >
                  Read more
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
              aria-label="Blog pagination"
            >
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrev}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50 dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] dark:text-slate-300 dark:hover:bg-[var(--navy-800)]"
                aria-label="Previous page"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400">
                Page {page} of {totalPages}
                {total > 0 && (
                  <span className="ml-1 text-slate-500 dark:text-slate-500">
                    ({total} posts)
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!hasNext}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50 dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] dark:text-slate-300 dark:hover:bg-[var(--navy-800)]"
                aria-label="Next page"
              >
                Next
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </nav>
          )}
        </>
      )}
    </PageLayout>
  );
}
