"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAttemptResult } from "@/hooks/queries";
import {
  getAttempt,
  getAttemptQuestions,
  submitAttemptAnswer,
  submitAttempt,
  type AttemptQuestion,
  type Attempt,
} from "@/lib/api";

type ScreenState = "loading" | "questions" | "submitting" | "result" | "error";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function AttemptPage() {
  const params = useParams();
  const attemptId = typeof params.id === "string" ? params.id : "";
  const { isReady } = useRequireAuth();
  const [screenState, setScreenState] = useState<ScreenState>("loading");
  const [questions, setQuestions] = useState<AttemptQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<Attempt | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const { data: resultItemsRaw, isPending: resultLoading, error: resultError } = useAttemptResult(
    attemptId,
    screenState === "result" && showReview
  );
  const resultItems = Array.isArray(resultItemsRaw) ? resultItemsRaw : [];
  // Fallback: when API returns no details, show what we have from this session (questions + selected options)
  const sessionReviewItems =
    resultItems.length === 0 &&
    questions.length > 0 &&
    Object.keys(selectedOptions).length > 0
      ? questions
          .filter((q) => selectedOptions[q.questionId])
          .map((q) => {
            const optId = selectedOptions[q.questionId];
            const opt = (q.options ?? []).find((o) => o.id === optId);
            return {
              questionId: q.questionId,
              questionText: q.questionText ?? "",
              selectedOptionText: opt?.optionText ?? null,
              isCorrect: null,
              explanation: null,
              marks: q.marks ?? null,
            };
          })
      : [];

  useEffect(() => {
    if (!attemptId || !isReady) return;
    getAttempt(attemptId)
      .then((attempt) => {
        if (attempt.submittedAt != null && attempt.score != null) {
          setResult(attempt);
          setScreenState("result");
          return;
        }
        return getAttemptQuestions(attemptId).then((q) => {
          setQuestions(Array.isArray(q) ? q : []);
          setScreenState("questions");
        });
      })
      .catch(async () => {
        try {
          const attempt = await getAttempt(attemptId);
          if (attempt.submittedAt != null && attempt.score != null) {
            setResult(attempt);
            setScreenState("result");
            return;
          }
        } catch {
          // ignore
        }
        setErrorMsg("Failed to load questions. The attempt may have already been submitted.");
        setScreenState("error");
      });
  }, [attemptId, isReady]);

  const handleSelectOption = useCallback(
    async (questionId: string, optionId: string) => {
      if (submittedAnswers.has(questionId)) return;
      setSelectedOptions((prev) => ({ ...prev, [questionId]: optionId }));
      setSubmittedAnswers((prev) => new Set(prev).add(questionId));
      try {
        await submitAttemptAnswer(attemptId, questionId, optionId);
      } catch {
        // answer save failed; user can still continue
      }
    },
    [attemptId, submittedAnswers]
  );

  const handleSubmit = useCallback(async () => {
    setScreenState("submitting");
    try {
      const updated = await submitAttempt(attemptId);
      setResult(updated);
      setScreenState("result");
    } catch {
      setErrorMsg("Failed to submit the test. Please try again.");
      setScreenState("error");
    }
  }, [attemptId]);

  if (!attemptId) {
    return (
      <PageLayout title="Attempt" icon="quiz">
        <p className="text-slate-600 dark:text-slate-400">Invalid attempt.</p>
        <Link href="/tests" className="mt-4 text-[var(--primary)] hover:underline">
          Back to Tests
        </Link>
      </PageLayout>
    );
  }

  if (screenState === "loading") {
    return (
      <PageLayout title="Loading…" icon="quiz">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading questions…</p>
        </div>
      </PageLayout>
    );
  }

  if (screenState === "submitting") {
    return (
      <PageLayout title="Submitting…" icon="quiz">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Submitting your test…</p>
        </div>
      </PageLayout>
    );
  }

  if (screenState === "error") {
    return (
      <PageLayout title="Error" icon="quiz">
        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]">
          <span className="text-4xl">⚠️</span>
          <p className="mt-4 text-center text-slate-600 dark:text-slate-400">{errorMsg}</p>
          <Link
            href="/tests"
            className="mt-6 rounded-xl border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 dark:border-[var(--navy-700)] dark:text-slate-300 dark:hover:bg-[var(--navy-800)]"
          >
            Back to Tests
          </Link>
        </div>
      </PageLayout>
    );
  }

  if (screenState === "result" && result) {
    const total = questions.length;
    const answered = submittedAnswers.size;
    return (
      <PageLayout title="Test submitted" icon="emoji_events">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] sm:p-8">
          <div className="text-center">
            <p className="text-5xl">🎉</p>
            <h2 className="mt-4 text-2xl font-bold text-[var(--navy-900)] dark:text-white">
              Test submitted!
            </h2>
            <p className="mt-1 text-slate-600 dark:text-slate-400">Here&apos;s how you did</p>
          </div>
          <div className="mt-8 rounded-xl bg-[var(--primary)]/10 p-6 text-center dark:bg-[var(--primary)]/20">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Your score</p>
            <p className="mt-1 text-4xl font-bold text-[var(--primary)]">{result.score ?? 0}</p>
          </div>
          {total > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg border border-slate-200 p-4 dark:border-[var(--navy-700)]">
                <p className="text-2xl font-bold text-[var(--navy-900)] dark:text-white">{total}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Questions</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 dark:border-[var(--navy-700)]">
                <p className="text-2xl font-bold text-[var(--navy-900)] dark:text-white">
                  {answered}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Answered</p>
              </div>
            </div>
          )}
          {!showReview ? (
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => setShowReview(true)}
                className="rounded-xl border border-[var(--primary)] bg-transparent px-6 py-3 font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10"
              >
                Review answers
              </button>
              <Link
                href="/tests"
                className="rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white shadow-lg shadow-[var(--primary)]/20 transition-opacity hover:opacity-90"
              >
                Back to Tests
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:border-[var(--navy-700)] dark:text-slate-300 dark:hover:bg-[var(--navy-800)]"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <>
              <h3 className="mt-8 text-lg font-bold text-[var(--navy-900)] dark:text-white">
                Review answers
              </h3>
              {resultLoading ? (
                <p className="mt-4 text-slate-500 dark:text-slate-400">Loading…</p>
              ) : resultError ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Could not load answer details
                  </p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                    {resultError instanceof Error ? resultError.message : "A network or server error occurred."} Make
                    sure you were logged in when taking the test and try again.
                  </p>
                </div>
              ) : resultItems.length > 0 ? (
                <ul className="mt-4 space-y-6">
                  {resultItems.map((item, index) => (
                    <li
                      key={item.questionId}
                      className="rounded-xl border border-slate-200 p-4 dark:border-[var(--navy-700)]"
                    >
                      <p className="font-medium text-[var(--navy-900)] dark:text-white">
                        {index + 1}. {item.questionText}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-lg px-2 py-0.5 text-sm font-semibold ${
                            item.isCorrect
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {item.isCorrect ? "Correct" : "Incorrect"}
                        </span>
                        {item.marks != null && (
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {item.marks} pt{item.marks !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      {item.selectedOptionText && (
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          Your answer: {item.selectedOptionText}
                        </p>
                      )}
                      {!item.isCorrect && item.correctOptionText && (
                        <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          Correct: {item.correctOptionText}
                        </p>
                      )}
                      {item.explanation && (
                        <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-[var(--navy-800)]">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            Explanation:
                          </span>{" "}
                          {item.explanation}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : sessionReviewItems.length > 0 ? (
                <>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Answer details from this session (correct/incorrect and explanations could not be loaded from the server).
                  </p>
                  <ul className="mt-4 space-y-6">
                    {sessionReviewItems.map((item, index) => (
                      <li
                        key={item.questionId}
                        className="rounded-xl border border-slate-200 p-4 dark:border-[var(--navy-700)]"
                      >
                        <p className="font-medium text-[var(--navy-900)] dark:text-white">
                          {index + 1}. {item.questionText}
                        </p>
                        {item.selectedOptionText && (
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Your answer: {item.selectedOptionText}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-4 text-slate-500 dark:text-slate-400">
                  No answer details available. Answers are saved as you select them; if you see this after submitting,
                  they may not have been saved (e.g. connection issues). Try taking the test again while staying logged in.
                </p>
              )}
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href="/tests"
                  className="rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white shadow-lg shadow-[var(--primary)]/20 transition-opacity hover:opacity-90"
                >
                  Back to Tests
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:border-[var(--navy-700)] dark:text-slate-300 dark:hover:bg-[var(--navy-800)]"
                >
                  Dashboard
                </Link>
              </div>
            </>
          )}
        </div>
      </PageLayout>
    );
  }

  if (screenState !== "questions" || questions.length === 0) {
    return (
      <PageLayout title="Attempt" icon="quiz">
        <p className="text-slate-600 dark:text-slate-400">No questions in this test.</p>
        <Link href="/tests" className="mt-4 text-[var(--primary)] hover:underline">
          Back to Tests
        </Link>
      </PageLayout>
    );
  }

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <PageLayout title="Test" icon="quiz">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-[var(--navy-800)]">
          <div className="flex items-center justify-between">
            <Link
              href="/tests"
              className="text-sm font-medium text-slate-600 hover:text-[var(--primary)] dark:text-slate-400"
            >
              Exit
            </Link>
            <span className="text-sm font-semibold text-[var(--navy-900)] dark:text-white">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="w-10" />
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-[var(--navy-700)]">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {current.difficulty && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                  DIFFICULTY_COLORS[current.difficulty.toLowerCase()] ??
                  "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {current.difficulty}
              </span>
            )}
            {current.marks != null && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {current.marks} mark{current.marks !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-lg font-semibold text-[var(--navy-900)] dark:text-white">
            {current.questionText}
          </p>
          <ul className="mt-6 space-y-3">
            {(current.options ?? []).map((opt) => {
              const isSelected = selectedOptions[current.questionId] === opt.id;
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectOption(current.questionId, opt.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20"
                        : "border-slate-200 hover:border-slate-300 dark:border-[var(--navy-700)] dark:hover:border-[var(--navy-600)]"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                        isSelected
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-slate-300 dark:border-[var(--navy-600)]"
                      }`}
                    >
                      {isSelected ? (
                        <span className="material-symbols-outlined text-sm">check</span>
                      ) : null}
                    </span>
                    <span className="text-slate-700 dark:text-slate-200">{opt.optionText}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex justify-between border-t border-slate-200 px-4 py-4 dark:border-[var(--navy-800)]">
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="rounded-xl border border-slate-200 px-5 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[var(--navy-700)] dark:text-slate-300 dark:hover:bg-[var(--navy-800)]"
          >
            ← Previous
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-emerald-600/20 transition-opacity hover:opacity-90"
            >
              Submit test
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              className="rounded-xl bg-[var(--primary)] px-5 py-2.5 font-bold text-white shadow-lg shadow-[var(--primary)]/20 transition-opacity hover:opacity-90"
            >
              Next →
            </button>
          )}
        </div>
      </div>

      <Link
        href="/tests"
        className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Back to Tests
      </Link>
    </PageLayout>
  );
}
