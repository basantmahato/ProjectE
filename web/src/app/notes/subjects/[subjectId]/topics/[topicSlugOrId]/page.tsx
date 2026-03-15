"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { getTopicNotes, getTopicNotesBySlugs, type Note } from "@/lib/api";

const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export default function TopicNotesPage() {
  const params = useParams();
  const subjectParam = typeof params.subjectId === "string" ? params.subjectId : "";
  const topicParam = typeof params.topicSlugOrId === "string" ? params.topicSlugOrId : "";
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subjectParam || !topicParam) return;
    const fetch = isUuid(topicParam)
      ? getTopicNotes(topicParam)
      : getTopicNotesBySlugs(subjectParam, topicParam);
    fetch
      .then(setNotes)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load notes"))
      .finally(() => setLoading(false));
  }, [subjectParam, topicParam]);

  if (!subjectParam || !topicParam) {
    return (
      <PageLayout title="Notes" icon="menu_book">
        <p className="text-slate-600 dark:text-slate-400">Invalid topic.</p>
        <Link href="/notes" className="mt-4 text-[var(--primary)] hover:underline">
          Back to Notes
        </Link>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Notes"
      description="Select a note to read."
      icon="menu_book"
    >
      <Link
        href={`/notes/subjects/${subjectParam}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Topics
      </Link>
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
      ) : notes.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400">No notes in this topic.</p>
      ) : (
        <ul className="space-y-4">
          {notes.map((note) => (
            <li key={note.id}>
              <Link
                href={`/notes/view/${note.slug ?? note.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[var(--primary)]/30 hover:shadow-md dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]"
              >
                <h2 className="font-bold text-[var(--navy-900)] dark:text-white">
                  {note.title ?? "Untitled"}
                </h2>
                {note.content && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                    {note.content}
                  </p>
                )}
                <span className="mt-2 inline-flex items-center gap-1 text-sm text-[var(--primary)]">
                  Read
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageLayout>
  );
}
