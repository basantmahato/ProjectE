"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  getBlogPost,
  getBlogPostBySlug,
  getPostComments,
  addPostComment,
  addCommentReply,
  type BlogPost,
  type BlogComment,
} from "@/lib/api";

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function displayName(c: { userName: string | null; userEmail: string | null }): string {
  if (c.userName?.trim()) return c.userName;
  if (c.userEmail) return c.userEmail.split("@")[0];
  return "Anonymous";
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { isLoggedIn } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [replyTextByCommentId, setReplyTextByCommentId] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);

  const fetchComments = useCallback(() => {
    if (!post?.id) return;
    getPostComments(post.id)
      .then((c) => setComments(Array.isArray(c) ? c : []))
      .catch(() => setComments([]));
  }, [post?.id]);

  const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

  useEffect(() => {
    if (!slug) return;
    const fetchPost = isUuid(slug) ? getBlogPost(slug) : getBlogPostBySlug(slug);
    fetchPost
      .then((p) => {
        setPost(p);
        return getPostComments(p.id);
      })
      .then((c) => setComments(Array.isArray(c) ? c : []))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load post"))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (post?.id) fetchComments();
  }, [post?.id, fetchComments]);

  if (!slug) {
    return (
      <PageLayout title="Post" icon="article">
        <p className="text-slate-600 dark:text-slate-400">Invalid post.</p>
        <Link href="/blogs" className="mt-4 text-[var(--primary)] hover:underline">
          Back to Blog
        </Link>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout title="Loading…" icon="article">
        <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-[var(--navy-700)]" />
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-[var(--navy-800)]" />
        <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-[var(--navy-800)]" />
      </PageLayout>
    );
  }

  if (error || !post) {
    return (
      <PageLayout title="Error" icon="article">
        <p className="text-red-600 dark:text-red-400">{error || "Post not found."}</p>
        <Link href="/blogs" className="mt-4 text-[var(--primary)] hover:underline">
          Back to Blog
        </Link>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={post.title}
      description={post.excerpt ?? undefined}
      icon="article"
    >
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--primary)]">
          {formatDate(post.publishedAt)}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--navy-900)] dark:text-white sm:text-3xl">
          {post.title}
        </h1>
        {post.content && (
          <div className="mt-6 whitespace-pre-wrap text-slate-600 dark:text-slate-400">
            {post.content}
          </div>
        )}
      </article>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-[var(--navy-900)] dark:text-white">
          Comments ({comments.length})
        </h2>

        {isLoggedIn ? (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]">
            <label htmlFor="comment-input" className="sr-only">
              Write a comment
            </label>
            <textarea
              id="comment-input"
              rows={3}
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 dark:border-[var(--navy-700)] dark:bg-[var(--navy-800)] dark:text-white dark:placeholder-slate-500"
            />
            <button
              type="button"
              onClick={async () => {
                if (!post.id || !commentText.trim() || submittingComment) return;
                setSubmittingComment(true);
                try {
                  await addPostComment(post.id, commentText.trim());
                  setCommentText("");
                  fetchComments();
                } finally {
                  setSubmittingComment(false);
                }
              }}
              disabled={!commentText.trim() || submittingComment}
              className="mt-3 rounded-lg bg-[var(--primary)] px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submittingComment ? "Posting…" : "Post comment"}
            </button>
          </div>
        ) : (
          <p className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-[var(--navy-700)] dark:bg-[var(--navy-800)] dark:text-slate-400">
            <Link href="/login" className="font-medium text-[var(--primary)] hover:underline">
              Sign in
            </Link>{" "}
            to leave a comment.
          </p>
        )}

        {comments.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white py-8 text-center text-slate-500 dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] dark:text-slate-400">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <ul className="space-y-4">
            {comments.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-medium text-[var(--navy-900)] dark:text-white">
                    {displayName(c)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(c.createdAt)}
                  </p>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{c.content}</p>
                {c.replies?.length > 0 && (
                  <ul className="mt-3 ml-4 space-y-2 border-l-2 border-slate-200 pl-4 dark:border-[var(--navy-700)]">
                    {c.replies.map((r) => (
                      <li key={r.id}>
                        <p className="text-sm font-medium text-[var(--navy-900)] dark:text-white">
                          {r.userName ?? "Anonymous"}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{r.content}</p>
                        <p className="text-xs text-slate-500">{formatDate(r.createdAt)}</p>
                      </li>
                    ))}
                  </ul>
                )}
                {isLoggedIn && (
                  <div className="mt-3 flex flex-col gap-2">
                    <textarea
                      rows={2}
                      placeholder="Write a reply..."
                      value={replyTextByCommentId[c.id] ?? ""}
                      onChange={(e) =>
                        setReplyTextByCommentId((prev) => ({ ...prev, [c.id]: e.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder-slate-400 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/20 dark:border-[var(--navy-700)] dark:bg-[var(--navy-800)] dark:text-white dark:placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const text = replyTextByCommentId[c.id]?.trim();
                        if (!text || submittingReplyId === c.id) return;
                        setSubmittingReplyId(c.id);
                        try {
                          await addCommentReply(c.id, text);
                          setReplyTextByCommentId((prev) => ({ ...prev, [c.id]: "" }));
                          fetchComments();
                        } finally {
                          setSubmittingReplyId(null);
                        }
                      }}
                      disabled={
                        !(replyTextByCommentId[c.id]?.trim()) || submittingReplyId === c.id
                      }
                      className="self-start rounded-lg border border-[var(--primary)] bg-transparent px-3 py-1.5 text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submittingReplyId === c.id ? "Posting…" : "Reply"}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href="/blogs"
        className="mt-8 inline-flex items-center gap-2 text-[var(--primary)] hover:underline"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Blog
      </Link>
    </PageLayout>
  );
}
