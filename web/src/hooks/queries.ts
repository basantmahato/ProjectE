"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  getBlogPostsPaginated,
  getBlogPost,
  getBlogPostBySlug,
  getPostComments,
  getPublishedTests,
  getUpcomingTests,
  getPublishedTest,
  getPublishedTestBySlug,
  getPublishedMockTests,
  getPublishedMockTest,
  getPublishedMockTestBySlug,
  getSamplePapersList,
  getSamplePaper,
  getSamplePaperBySlug,
  getNoteSubjects,
  getSubjectTopics,
  getTopicNotes,
  getNote,
  getNoteBySlug,
  getNotifications,
  getNotificationsPaginated,
  getInterviewPrepList,
  getInterviewPrepRole,
  getAttempt,
  getAttemptQuestions,
  getAttemptResult,
  getCurrentUser,
  getSubjectTopicsBySlug,
  getTopicNotesBySlugs,
  type BlogPostsPaginatedResponse,
  type BlogPost,
  type BlogComment,
  type Test,
  type SamplePaperListItem,
  type SamplePaperFull,
  type Subject,
  type Topic,
  type Note,
  type Notification,
  type InterviewPrepJobRole,
  type Attempt,
  type AttemptQuestion,
  type AttemptResultItem,
  type CurrentUser,
} from "@/lib/api";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(v: string) {
  return UUID_RE.test(v);
}

// --- Blog ---

export function useBlogPostsPaginated(page: number, limit: number) {
  return useQuery<BlogPostsPaginatedResponse>({
    queryKey: ["blogs", "paginated", page, limit],
    queryFn: () => getBlogPostsPaginated(page, limit),
  });
}

export function useBlogPost(slugOrId: string) {
  return useQuery<BlogPost>({
    queryKey: ["blogs", "post", slugOrId],
    queryFn: () =>
      isUuid(slugOrId) ? getBlogPost(slugOrId) : getBlogPostBySlug(slugOrId),
    enabled: !!slugOrId,
  });
}

export function usePostComments(postId: string | undefined) {
  return useQuery<BlogComment[]>({
    queryKey: ["blogs", "comments", postId],
    queryFn: () => getPostComments(postId!),
    enabled: !!postId,
  });
}

// --- Tests ---

export function usePublishedTests() {
  return useQuery<Test[]>({
    queryKey: ["tests", "published"],
    queryFn: getPublishedTests,
  });
}

export function useUpcomingTests() {
  return useQuery<Test[]>({
    queryKey: ["tests", "upcoming"],
    queryFn: getUpcomingTests,
  });
}

export function usePublishedTest(slugOrId: string) {
  return useQuery<Test>({
    queryKey: ["tests", "published", slugOrId],
    queryFn: () =>
      isUuid(slugOrId)
        ? getPublishedTest(slugOrId)
        : getPublishedTestBySlug(slugOrId),
    enabled: !!slugOrId,
  });
}

// --- Mock Tests ---

export function usePublishedMockTests() {
  return useQuery<Test[]>({
    queryKey: ["mock-tests", "published"],
    queryFn: getPublishedMockTests,
  });
}

export function usePublishedMockTest(slugOrId: string) {
  return useQuery<Test>({
    queryKey: ["mock-tests", "published", slugOrId],
    queryFn: () =>
      isUuid(slugOrId)
        ? getPublishedMockTest(slugOrId)
        : getPublishedMockTestBySlug(slugOrId),
    enabled: !!slugOrId,
  });
}

// --- Sample Papers ---

export function useSamplePapersList() {
  return useQuery<SamplePaperListItem[]>({
    queryKey: ["sample-papers", "list"],
    queryFn: getSamplePapersList,
  });
}

export function useSamplePaper(slugOrId: string) {
  return useQuery<SamplePaperFull>({
    queryKey: ["sample-papers", "read", slugOrId],
    queryFn: () =>
      isUuid(slugOrId)
        ? getSamplePaper(slugOrId)
        : getSamplePaperBySlug(slugOrId),
    enabled: !!slugOrId,
  });
}

// --- Notes ---

export function useNoteSubjects() {
  return useQuery<Subject[]>({
    queryKey: ["notes", "subjects"],
    queryFn: getNoteSubjects,
  });
}

export function useSubjectTopics(subjectId: string) {
  return useQuery<Topic[]>({
    queryKey: ["notes", "subjects", subjectId, "topics"],
    queryFn: () => getSubjectTopics(subjectId),
    enabled: !!subjectId,
  });
}

export function useSubjectTopicsBySlug(subjectSlug: string) {
  return useQuery<Topic[]>({
    queryKey: ["notes", "subjects", "slug", subjectSlug, "topics"],
    queryFn: () => getSubjectTopicsBySlug(subjectSlug),
    enabled: !!subjectSlug,
  });
}

export function useTopicNotes(topicId: string) {
  return useQuery<Note[]>({
    queryKey: ["notes", "topics", topicId, "notes"],
    queryFn: () => getTopicNotes(topicId),
    enabled: !!topicId,
  });
}

export function useTopicNotesBySlugs(subjectSlug: string, topicSlug: string) {
  return useQuery<Note[]>({
    queryKey: ["notes", "subjects", subjectSlug, "topics", topicSlug, "notes"],
    queryFn: () => getTopicNotesBySlugs(subjectSlug, topicSlug),
    enabled: !!subjectSlug && !!topicSlug,
  });
}

export function useNote(slugOrId: string) {
  return useQuery<Note>({
    queryKey: ["notes", "note", slugOrId],
    queryFn: () =>
      isUuid(slugOrId) ? getNote(slugOrId) : getNoteBySlug(slugOrId),
    enabled: !!slugOrId,
  });
}

// --- Notifications ---

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });
}

const NOTIFICATIONS_PAGE_SIZE = 20;

export function useNotificationsInfinite() {
  return useInfiniteQuery({
    queryKey: ["notifications", "infinite"],
    queryFn: ({ pageParam }) =>
      getNotificationsPaginated(pageParam as number, NOTIFICATIONS_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}

// --- Interview Prep ---

export function useInterviewPrepList() {
  return useQuery<InterviewPrepJobRole[]>({
    queryKey: ["interview-prep", "list"],
    queryFn: getInterviewPrepList,
  });
}

export function useInterviewPrepRole(roleId: string) {
  return useQuery({
    queryKey: ["interview-prep", "role", roleId],
    queryFn: () => getInterviewPrepRole(roleId),
    enabled: !!roleId,
  });
}

// --- Attempts ---

export function useAttempt(attemptId: string) {
  return useQuery<Attempt>({
    queryKey: ["attempts", attemptId],
    queryFn: () => getAttempt(attemptId),
    enabled: !!attemptId,
  });
}

export function useAttemptQuestions(attemptId: string, enabled = true) {
  return useQuery<AttemptQuestion[]>({
    queryKey: ["attempts", attemptId, "questions"],
    queryFn: () => getAttemptQuestions(attemptId),
    enabled: !!attemptId && enabled,
  });
}

export function useAttemptResult(attemptId: string, enabled: boolean) {
  return useQuery<AttemptResultItem[]>({
    queryKey: ["attempts", attemptId, "result"],
    queryFn: () => getAttemptResult(attemptId),
    enabled: !!attemptId && enabled,
  });
}

// --- Auth ---

export function useCurrentUser(enabled = true) {
  return useQuery<CurrentUser>({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    enabled,
  });
}
