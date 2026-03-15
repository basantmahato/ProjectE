"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { getNote, getNoteBySlug, type Note } from "@/lib/api";

export default function NoteViewPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

  useEffect(() => {
    if (!slug) return;
    const fetchNote = isUuid(slug) ? getNote(slug) : getNoteBySlug(slug);
    fetchNote
      .then(setNote)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load note"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (!slug) {
    return (
      <PageLayout title="Note" icon="menu_book">
        <p className="text-slate-600 dark:text-slate-400">Invalid note.</p>
        <Link href="/notes" className="mt-4 text-[var(--primary)] hover:underline">
          Back to Notes
        </Link>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout title="Loading…" icon="menu_book">
        <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-[var(--navy-700)]" />
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-[var(--navy-800)]" />
      </PageLayout>
    );
  }

  if (error || !note) {
    return (
      <PageLayout title="Error" icon="menu_book">
        <p className="text-red-600 dark:text-red-400">{error || "Note not found."}</p>
        <Link href="/notes" className="mt-4 text-[var(--primary)] hover:underline">
          Back to Notes
        </Link>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={note.title ?? "Note"}
      description={undefined}
      icon="menu_book"
    >
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] sm:p-8">
        <h1 className="text-2xl font-bold text-[var(--navy-900)] dark:text-white">
          {note.title ?? "Untitled"}
        </h1>
        {note.content && (
          <div className="mt-6 whitespace-pre-wrap text-slate-600 dark:text-slate-400">
            {note.content}
          </div>
        )}
      </article>
      <Link
        href="/notes"
        className="mt-8 inline-flex items-center gap-2 text-[var(--primary)] hover:underline"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Notes
      </Link>
    </PageLayout>
  );
}
