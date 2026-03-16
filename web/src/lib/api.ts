import { getToken } from "./auth";

const GUEST_DEVICE_ID_KEY = "guest_device_id";

function getOrCreateGuestDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(GUEST_DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID?.() ?? `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(GUEST_DEVICE_ID_KEY, id);
  }
  return id;
}

// When NEXT_PUBLIC_API_URL is set, use it (e.g. production). Otherwise use same-origin /api (proxied to backend via next.config rewrites).
const API_BASE_URL =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "";

/**
 * Parse error message from NestJS/backend response.
 * Handles { message: string } and { statusCode, message, error }.
 */
function getErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "message" in data) {
    const msg = (data as { message: unknown }).message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg)) return msg[0] ?? fallback;
  }
  return fallback;
}

function apiUrl(path: string): string {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : `/api${path}`;
}

async function apiFetch(
  path: string,
  options: RequestInit = {},
  useAuth = false
): Promise<Response> {
  const url = apiUrl(path);
  const fetchFn = useAuth ? fetchWithAuth : fetch;
  return fetchFn(url, options);
}

async function apiGet<T>(path: string, useAuth = false): Promise<T> {
  const res = await apiFetch(path, { method: "GET" }, useAuth);
  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    throw new Error(getErrorMessage(data, "Request failed"));
  }
  return data as T;
}

async function apiPost(
  path: string,
  body?: unknown,
  useAuth = false
): Promise<unknown> {
  const res = await apiFetch(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    },
    useAuth
  );
  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    throw new Error(getErrorMessage(data, "Request failed"));
  }
  return data;
}

async function apiPatch<T = unknown>(
  path: string,
  body?: unknown,
  useAuth = false
): Promise<T> {
  const res = await apiFetch(
    path,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    },
    useAuth
  );
  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    throw new Error(getErrorMessage(data, "Request failed"));
  }
  return data as T;
}

// --- Auth (existing) ---
export type LoginResponse = {
  message: string;
  user: { id: string; email: string; name?: string | null; role: string };
  access_token: string;
};

export type RegisterResponse = {
  message: string;
  user: { id: string; email: string; name?: string | null; role: string };
  access_token: string;
};

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    throw new Error(getErrorMessage(data, "Login failed"));
  }
  return data as LoginResponse;
}

export async function register(body: {
  email: string;
  password: string;
  name?: string;
  role?: "user";
}): Promise<RegisterResponse> {
  const res = await fetch(apiUrl("/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    throw new Error(getErrorMessage(data, "Registration failed"));
  }
  return data as RegisterResponse;
}

/** Google Sign-In: send id_token from Google Identity Services to backend. Returns same shape as login. */
export async function loginWithGoogle(idToken: string): Promise<LoginResponse> {
  const res = await fetch(apiUrl("/auth/google"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });
  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    throw new Error(getErrorMessage(data, "Google sign-in failed"));
  }
  return data as LoginResponse;
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    headers.set("X-Device-ID", getOrCreateGuestDeviceId());
  }
  return fetch(url, { ...options, headers });
}

// --- Auth profile & settings ---
export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan?: string;
};

export type GetMeResponse = { user: CurrentUser };
export type UpdateProfileResponse = { user: CurrentUser };

export async function getCurrentUser(): Promise<CurrentUser> {
  const data = await apiGet<GetMeResponse>("/auth/me", true);
  return data.user;
}

export async function updateProfile(body: {
  name?: string;
  email?: string;
}): Promise<CurrentUser> {
  const data = await apiPatch<UpdateProfileResponse>("/auth/profile", body, true);
  return data.user;
}

export async function changePassword(body: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiPost("/auth/change-password", body, true);
}

// --- Billing ---
/** Plan IDs that require payment (used for billing and to hide upgrade CTA). */
export const PAID_PLANS = ["basic", "premium"] as const;
export type PaidPlanId = (typeof PAID_PLANS)[number];

export function hasPaidPlan(plan: string | undefined | null): boolean {
  return plan === "basic" || plan === "premium";
}

export type CreateOrderResponse = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
};

export type VerifyPaymentBody = {
  planId: "basic" | "premium";
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type VerifyPaymentResponse = { user: CurrentUser };

export function createBillingOrder(planId: "basic" | "premium"): Promise<CreateOrderResponse> {
  return apiPost("/billing/order", { planId }, true) as Promise<CreateOrderResponse>;
}

export function verifyBillingPayment(body: VerifyPaymentBody): Promise<VerifyPaymentResponse> {
  return apiPost("/billing/verify", body, true) as Promise<VerifyPaymentResponse>;
}

// --- Dashboard ---
export type DashboardStats = {
  totalMarks: number;
  accuracyPercent: number;
  mockTestsTaken?: number;
};
export type LeaderboardEntry = {
  id: string;
  rank: number;
  name: string | null;
  totalMarks: number;
};

export function getDashboardStats(): Promise<DashboardStats> {
  return apiGet<DashboardStats>("/dashboard", true);
}

export function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return apiGet<LeaderboardEntry[] | { data?: LeaderboardEntry[] }>("/dashboard/leaderboard", false).then(
    (r) => (Array.isArray(r) ? r : (Array.isArray(r?.data) ? r.data : []))
  );
}

// --- Attempts ---
export type Attempt = {
  id: string;
  testId: string;
  userId?: string | null;
  deviceId?: string | null;
  startedAt?: string;
  submittedAt?: string | null;
  score?: number | null;
  [key: string]: unknown;
};

export function getMyAttempts(testId?: string): Promise<Attempt[]> {
  const path = testId ? `/attempts?testId=${encodeURIComponent(testId)}` : "/attempts";
  return apiGet<Attempt[] | { data?: Attempt[] }>(path, true).then((r) =>
    Array.isArray(r) ? r : (Array.isArray(r?.data) ? r.data : [])
  );
}

// --- Blog ---
export type BlogPostListItem = {
  id: string;
  slug: string | null;
  title: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

export type BlogPost = BlogPostListItem & {
  content?: string | null;
  [key: string]: unknown;
};

export type BlogComment = {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string | null;
  userName: string | null;
  userEmail: string | null;
  replies: Array<{
    id: string;
    content: string;
    createdAt: string | null;
    userName: string | null;
    [key: string]: unknown;
  }>;
};

export function getBlogPosts(): Promise<BlogPostListItem[]> {
  return apiGet<BlogPostListItem[]>("/blog/posts");
}

export type BlogPostsPaginatedResponse = {
  data: BlogPostListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function getBlogPostsPaginated(
  page: number = 1,
  limit: number = 9,
): Promise<BlogPostsPaginatedResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiGet<BlogPostsPaginatedResponse>(`/blog/posts?${params.toString()}`);
}

export function getBlogPost(id: string): Promise<BlogPost> {
  return apiGet<BlogPost>(`/blog/posts/${id}`);
}

export function getBlogPostBySlug(slug: string): Promise<BlogPost> {
  return apiGet<BlogPost>(`/blog/posts/slug/${encodeURIComponent(slug)}`);
}

export function getPostComments(postId: string): Promise<BlogComment[]> {
  return apiGet<BlogComment[]>(`/blog/posts/${postId}/comments`);
}

export function addPostComment(postId: string, content: string): Promise<unknown> {
  return apiPost(`/blog/posts/${postId}/comments`, { content }, true);
}

export function addCommentReply(commentId: string, content: string): Promise<unknown> {
  return apiPost(`/blog/comments/${commentId}/replies`, { content }, true);
}

// --- Notes ---
export type Subject = { id: string; slug?: string; name?: string; [key: string]: unknown };
export type Topic = { id: string; slug?: string; name?: string; subjectId?: string; [key: string]: unknown };
export type Note = { id: string; slug?: string; title?: string; content?: string; topicId?: string; [key: string]: unknown };

export function getNoteSubjects(): Promise<Subject[]> {
  return apiGet<Subject[] | { data: Subject[] }>("/notes/subjects").then((r) =>
    Array.isArray(r) ? r : (r?.data ?? [])
  );
}

export function getSubjectBySlug(slug: string): Promise<Subject> {
  return apiGet<Subject>(`/notes/subjects/slug/${encodeURIComponent(slug)}`);
}

export function getSubjectTopics(subjectId: string): Promise<Topic[]> {
  return apiGet<Topic[] | { data: Topic[] }>(`/notes/subjects/${subjectId}/topics`).then((r) =>
    Array.isArray(r) ? r : (r?.data ?? [])
  );
}

export function getSubjectTopicsBySlug(subjectSlug: string): Promise<Topic[]> {
  return apiGet<Topic[] | { data: Topic[] }>(
    `/notes/subjects/slug/${encodeURIComponent(subjectSlug)}/topics`
  ).then((r) => (Array.isArray(r) ? r : (r?.data ?? [])));
}

export function getTopicNotes(topicId: string): Promise<Note[]> {
  return apiGet<Note[] | { data: Note[] }>(`/notes/topics/${topicId}/notes`).then((r) =>
    Array.isArray(r) ? r : (r?.data ?? [])
  );
}

export function getTopicNotesBySlugs(subjectSlug: string, topicSlug: string): Promise<Note[]> {
  return apiGet<Note[] | { data: Note[] }>(
    `/notes/subjects/slug/${encodeURIComponent(subjectSlug)}/topics/slug/${encodeURIComponent(topicSlug)}/notes`
  ).then((r) => (Array.isArray(r) ? r : (r?.data ?? [])));
}

export function getNote(noteId: string): Promise<Note> {
  return apiGet<Note>(`/notes/notes/${noteId}`);
}

export function getNoteBySlug(slug: string): Promise<Note> {
  return apiGet<Note>(`/notes/notes/slug/${encodeURIComponent(slug)}`);
}

// --- Tests ---
export type Test = {
  id: string;
  slug?: string;
  title: string;
  description?: string | null;
  durationMinutes?: number | null;
  totalMarks?: number | null;
  scheduledAt?: string | null;
  expiresAt?: string | null;
  isMock?: boolean;
  [key: string]: unknown;
};

/** Backend returns paginated { data, total, page, limit, totalPages }; we return the data array. */
export function getPublishedTests(): Promise<Test[]> {
  return apiGet<{ data?: Test[] } | Test[]>("/tests/published", true).then((res) =>
    Array.isArray(res) ? res : (Array.isArray((res as { data?: Test[] })?.data) ? (res as { data: Test[] }).data : [])
  );
}

export function getUpcomingTests(): Promise<Test[]> {
  return apiGet<Test[] | { data: Test[] }>("/tests/upcoming", true).then((res) =>
    Array.isArray(res) ? res : (res?.data ?? [])
  );
}

export function getPublishedTest(id: string): Promise<Test> {
  return apiGet<Test>(`/tests/published/${id}`, true);
}

export function getPublishedTestBySlug(slug: string): Promise<Test> {
  return apiGet<Test>(`/tests/published/slug/${encodeURIComponent(slug)}`, true);
}

// --- Attempts (start test, get questions, submit answers, submit attempt) ---
export type AttemptQuestionOption = {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect?: boolean | null;
};

export type AttemptQuestion = {
  testQuestionId: string;
  questionId: string;
  questionOrder: number;
  questionText: string;
  difficulty: string | null;
  marks: number | null;
  negativeMarks: number | null;
  options: AttemptQuestionOption[];
};

export function startAttempt(testId: string): Promise<{ id: string }> {
  return apiPost(`/attempts`, { testId }, true) as Promise<{ id: string }>;
}

export function getAttempt(attemptId: string): Promise<Attempt> {
  return apiGet<Attempt>(`/attempts/${attemptId}`, true);
}

export function getAttemptQuestions(attemptId: string): Promise<AttemptQuestion[]> {
  return apiGet<AttemptQuestion[]>(`/attempts/${attemptId}/questions`, true).then((r) =>
    Array.isArray(r) ? r : []
  );
}

export function submitAttemptAnswer(
  attemptId: string,
  questionId: string,
  selectedOptionId: string | null
): Promise<unknown> {
  return apiPost(`/attempts/${attemptId}/answers`, { questionId, selectedOptionId }, true);
}

export function submitAttempt(attemptId: string): Promise<Attempt> {
  return apiPost(`/attempts/${attemptId}/submit`, undefined, true) as Promise<Attempt>;
}

export type AttemptResultItem = {
  questionId: string;
  questionText: string;
  explanation: string | null;
  marks: number | null;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  isCorrect: boolean;
  correctOptionId: string | null;
  correctOptionText: string | null;
};

export function getAttemptResult(attemptId: string): Promise<AttemptResultItem[]> {
  return apiGet<AttemptResultItem[]>(`/attempts/${attemptId}/result`, true).then((r) =>
    Array.isArray(r) ? r : []
  );
}

// --- Mock tests ---
export function getPublishedMockTests(): Promise<Test[]> {
  return apiGet<Test[] | { data?: Test[] }>("/mock-tests/published", true).then((res) =>
    Array.isArray(res) ? res : (Array.isArray((res as { data?: Test[] })?.data) ? (res as { data: Test[] }).data : [])
  );
}

export function getPublishedMockTest(id: string): Promise<Test> {
  return apiGet<Test>(`/mock-tests/published/${id}`, true);
}

export function getPublishedMockTestBySlug(slug: string): Promise<Test> {
  return apiGet<Test>(`/mock-tests/published/slug/${encodeURIComponent(slug)}`, true);
}

// --- Sample papers ---
export type SamplePaperListItem = {
  id: string;
  slug?: string;
  title: string;
  description?: string | null;
  createdAt?: string | null;
  [key: string]: unknown;
};

export type SamplePaperQuestionOption = {
  id: string;
  optionText: string;
  isCorrect?: boolean | null;
  [key: string]: unknown;
};

export type SamplePaperQuestion = {
  id: string;
  questionText: string;
  explanation?: string | null;
  orderIndex?: number | null;
  options: SamplePaperQuestionOption[];
  [key: string]: unknown;
};

export type SamplePaperTopic = {
  id: string;
  name: string;
  questions: SamplePaperQuestion[];
  [key: string]: unknown;
};

export type SamplePaperSubject = {
  id: string;
  name: string;
  topics: SamplePaperTopic[];
  [key: string]: unknown;
};

export type SamplePaperFull = {
  id: string;
  slug?: string;
  title: string;
  description?: string | null;
  subjects: SamplePaperSubject[];
  [key: string]: unknown;
};

export function getSamplePapersList(): Promise<SamplePaperListItem[]> {
  return apiGet<SamplePaperListItem[] | { data: SamplePaperListItem[] }>("/sample-papers/list", true).then(
    (r) => (Array.isArray(r) ? r : (r?.data ?? []))
  );
}

/** Fetch full paper (subjects → topics → questions → options). Sends auth or X-Device-ID for guest. */
export function getSamplePaper(paperId: string): Promise<SamplePaperFull> {
  return samplePaperFetch<SamplePaperFull>(`/sample-papers/read/${paperId}`);
}

export function getSamplePaperBySlug(slug: string): Promise<SamplePaperFull> {
  return samplePaperFetch<SamplePaperFull>(
    `/sample-papers/read/slug/${encodeURIComponent(slug)}`
  );
}

/** GET sample paper with auth or X-Device-ID so both logged-in and guest can view. */
async function samplePaperFetch<T>(path: string): Promise<T> {
  const url = apiUrl(path);
  const headers: HeadersInit = {};
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    const deviceId = getOrCreateDeviceId();
    headers["X-Device-ID"] = deviceId;
  }
  const res = await fetch(url, { method: "GET", headers });
  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    throw new Error(getErrorMessage(data, "Request failed"));
  }
  return data as T;
}

const DEVICE_ID_KEY = "sample_paper_device_id";

function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID?.() ?? `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// --- Interview prep ---
export type InterviewPrepJobRole = {
  id: string;
  name?: string;
  [key: string]: unknown;
};

export function getInterviewPrepList(): Promise<InterviewPrepJobRole[]> {
  return apiGet<InterviewPrepJobRole[] | { data: InterviewPrepJobRole[] }>("/interview-prep/list", true).then(
    (r) => (Array.isArray(r) ? r : (r?.data ?? []))
  );
}

export function getInterviewPrepRole(roleId: string): Promise<unknown> {
  return apiGet(`/interview-prep/read/${roleId}`, true);
}

// --- Notifications ---
export type Notification = {
  id: string;
  title: string;
  body: string | null;
  type?: string | null;
  createdAt: string;
  read: boolean;
};

export type NotificationsPaginatedResponse = {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function getNotifications(): Promise<Notification[]> {
  return getNotificationsPaginated(1, 20).then((r) => (Array.isArray(r?.data) ? r.data : []));
}

export function getNotificationsPaginated(
  page: number = 1,
  limit: number = 20
): Promise<NotificationsPaginatedResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiGet<NotificationsPaginatedResponse>(`/notifications?${params.toString()}`, true);
}

export function markNotificationRead(id: string): Promise<unknown> {
  return apiPost(`/notifications/${id}/read`, undefined, true);
}

export function getVapidPublicKey(): Promise<{ vapidPublicKey: string | null }> {
  return apiGet<{ vapidPublicKey: string | null }>("/notifications/vapid-public-key", false);
}

export type WebPushSubscriptionPayload = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export function registerWebPushSubscription(
  subscription: WebPushSubscriptionPayload
): Promise<unknown> {
  return apiPost("/notifications/register-web-push", subscription, true);
}
