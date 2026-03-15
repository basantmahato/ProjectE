import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string; user: { id: string; email: string; role: string } }>('/auth/login', {
      email,
      password,
    }),
};

// Users
export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  totalMarks?: number | null;
  createdAt: string;
};
export const usersApi = {
  list: () => api.get<UserRow[]>('/users'),
  get: (id: string) => api.get<UserRow>(`/users/${id}`),
  create: (data: { email: string; password: string; name?: string; role?: 'user' | 'admin'; plan?: 'free' | 'basic' | 'premium' }) =>
    api.post<UserRow>('/users', data),
  update: (id: string, data: { email?: string; password?: string; name?: string; role?: 'user' | 'admin'; plan?: 'free' | 'basic' | 'premium' }) =>
    api.patch<UserRow>(`/users/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/users/${id}`),
};

// Subjects
export const subjectsApi = {
  list: () => api.get<Array<{ id: string; name: string; examType: string | null; createdAt: string }>>('/subjects'),
  get: (id: string) => api.get(`/subjects/${id}`),
  create: (data: { name: string; examType?: string }) => api.post('/subjects', data),
  update: (id: string, data: { name?: string; examType?: string }) => api.patch(`/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/subjects/${id}`),
};

// Topics
export const topicsApi = {
  list: () => api.get<Array<{ id: string; subjectId: string; name: string; createdAt: string }>>('/topics'),
  bySubject: (subjectId: string) => api.get(`/topics/by-subject/${subjectId}`),
  get: (id: string) => api.get(`/topics/${id}`),
  create: (data: { subjectId: string; name: string }) => api.post('/topics', data),
  update: (id: string, data: { name?: string }) => api.patch(`/topics/${id}`, data),
  delete: (id: string) => api.delete(`/topics/${id}`),
};

// Question Bank
export type BulkUploadOption = { optionText: string; isCorrect?: boolean };
export type BulkUploadQuestion = {
  questionText: string;
  difficulty?: string;
  marks?: number;
  negativeMarks?: number;
  explanation?: string;
  options?: BulkUploadOption[];
};
export type BulkUploadPayload = { topicId: string; questions: BulkUploadQuestion[] };

export const questionBankApi = {
  list: () => api.get('/question-bank'),
  byTopic: (topicId: string) => api.get(`/question-bank/by-topic/${topicId}`),
  get: (id: string) => api.get(`/question-bank/${id}`),
  create: (data: { topicId: string; questionText: string; difficulty?: string; marks?: number; negativeMarks?: number; explanation?: string }) =>
    api.post('/question-bank', data),
  bulkUpload: (data: BulkUploadPayload) => api.post<{ created: { questions: number; options: number }; errors?: { index: number; message: string }[] }>('/question-bank/bulk', data),
  update: (id: string, data: Partial<{ questionText: string; difficulty: string; marks: number; negativeMarks: number; explanation: string }>) =>
    api.patch(`/question-bank/${id}`, data),
  delete: (id: string) => api.delete(`/question-bank/${id}`),
};

// Question Options
export const questionOptionsApi = {
  list: () => api.get('/question-options'),
  byQuestion: (questionId: string) => api.get(`/question-options/by-question/${questionId}`),
  get: (id: string) => api.get(`/question-options/${id}`),
  create: (data: { questionId: string; optionText: string; isCorrect?: boolean; orderIndex?: number }) =>
    api.post('/question-options', data),
  update: (id: string, data: Partial<{ optionText: string; isCorrect: boolean; orderIndex: number }>) =>
    api.patch(`/question-options/${id}`, data),
  delete: (id: string) => api.delete(`/question-options/${id}`),
};

// Tests
export type BulkUploadTestItem = {
  title: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  isPublished?: boolean;
  scheduledAt?: string;
  expiresAt?: string;
};
export const testsApi = {
  list: () => api.get('/tests'),
  get: (id: string) => api.get(`/tests/${id}`),
  getQuestions: (testId: string) => api.get(`/tests/${testId}/questions`),
  create: (data: { title: string; description?: string; durationMinutes: number; totalMarks: number; isPublished?: boolean; scheduledAt?: string; expiresAt?: string }) =>
    api.post('/tests', data),
  bulkUpload: (data: { tests: BulkUploadTestItem[] }) =>
    api.post<{ created: { count: number }; errors?: { index: number; message: string }[] }>('/tests/bulk', data),
  update: (id: string, data: Partial<{ title: string; description: string; durationMinutes: number; totalMarks: number; isPublished: boolean; scheduledAt: string; expiresAt: string }>) =>
    api.patch(`/tests/${id}`, data),
  delete: (id: string) => api.delete(`/tests/${id}`),
  addQuestion: (testId: string, questionId: string, questionOrder?: number) =>
    api.post(`/tests/${testId}/questions`, { questionId, questionOrder }),
  removeQuestion: (testId: string, questionId: string) =>
    api.delete(`/tests/${testId}/questions/${questionId}`),
};

// Mock Tests
export type BulkUploadMockTestItem = {
  title: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  isPublished?: boolean;
  questionIds?: string[];
};
export const mockTestsApi = {
  list: () => api.get('/mock-tests'),
  get: (id: string) => api.get(`/mock-tests/${id}`),
  getQuestions: (id: string) => api.get(`/mock-tests/${id}/questions`),
  create: (data: { title: string; description?: string; durationMinutes: number; totalMarks: number; isPublished?: boolean; scheduledAt?: string; expiresAt?: string }) =>
    api.post('/mock-tests', data),
  bulkUpload: (data: { mockTests: BulkUploadMockTestItem[] }) =>
    api.post<{ created: { count: number }; errors?: { index: number; message: string }[] }>('/mock-tests/bulk', data),
  update: (id: string, data: Partial<{ title: string; description: string; durationMinutes: number; totalMarks: number; isPublished: boolean; scheduledAt: string; expiresAt: string }>) =>
    api.patch(`/mock-tests/${id}`, data),
  delete: (id: string) => api.delete(`/mock-tests/${id}`),
  addQuestion: (id: string, questionId: string, questionOrder?: number) =>
    api.post(`/mock-tests/${id}/questions`, { questionId, questionOrder }),
  removeQuestion: (id: string, testQuestionId: string) =>
    api.delete(`/mock-tests/${id}/questions/${testQuestionId}`),
};

// Sample Papers
export type BulkSamplePaperOption = { optionText: string; isCorrect?: boolean };
export type BulkSamplePaperQuestion = { questionText: string; explanation?: string; orderIndex?: number; options?: BulkSamplePaperOption[] };
export type BulkSamplePaperTopic = { name: string; questions?: BulkSamplePaperQuestion[] };
export type BulkSamplePaperSubject = { name: string; topics?: BulkSamplePaperTopic[] };
export type BulkSamplePaperItem = { slug?: string; title: string; description?: string; subjects: BulkSamplePaperSubject[] };
export const samplePapersApi = {
  list: () => api.get('/sample-papers'),
  get: (paperId: string) => api.get(`/sample-papers/${paperId}`),
  create: (data: { slug?: string; title: string; description?: string }) => api.post('/sample-papers', data),
  bulkUpload: (data: { papers: BulkSamplePaperItem[] }) =>
    api.post<{ created: { papers: number }; errors?: { index: number; message: string }[] }>('/sample-papers/bulk', data),
  update: (paperId: string, data: { slug?: string; title?: string; description?: string }) =>
    api.patch(`/sample-papers/${paperId}`, data),
  delete: (paperId: string) => api.delete(`/sample-papers/${paperId}`),
  subjects: {
    list: (paperId: string) => api.get(`/sample-papers/${paperId}/subjects`),
    create: (paperId: string, data: { name: string; orderIndex?: number }) =>
      api.post(`/sample-papers/${paperId}/subjects`, data),
    update: (paperId: string, subjectId: string, data: { name?: string; orderIndex?: number }) =>
      api.patch(`/sample-papers/${paperId}/subjects/${subjectId}`, data),
    delete: (paperId: string, subjectId: string) =>
      api.delete(`/sample-papers/${paperId}/subjects/${subjectId}`),
  },
  topics: (paperId: string, subjectId: string) => ({
    list: () => api.get(`/sample-papers/${paperId}/subjects/${subjectId}/topics`),
    create: (data: { name: string; orderIndex?: number }) =>
      api.post(`/sample-papers/${paperId}/subjects/${subjectId}/topics`, data),
    update: (topicId: string, data: { name?: string; orderIndex?: number }) =>
      api.patch(`/sample-papers/${paperId}/subjects/${subjectId}/topics/${topicId}`, data),
    delete: (topicId: string) => api.delete(`/sample-papers/${paperId}/subjects/${subjectId}/topics/${topicId}`),
  }),
  questions: (paperId: string, subjectId: string, topicId: string) => ({
    list: () => api.get(`/sample-papers/${paperId}/subjects/${subjectId}/topics/${topicId}/questions`),
    create: (data: { questionText: string; explanation?: string; orderIndex?: number }) =>
      api.post(`/sample-papers/${paperId}/subjects/${subjectId}/topics/${topicId}/questions`, data),
    update: (questionId: string, data: { questionText?: string; explanation?: string; orderIndex?: number }) =>
      api.patch(`/sample-papers/${paperId}/subjects/${subjectId}/topics/${topicId}/questions/${questionId}`, data),
    delete: (questionId: string) =>
      api.delete(`/sample-papers/${paperId}/subjects/${subjectId}/topics/${topicId}/questions/${questionId}`),
  }),
  options: (paperId: string, subjectId: string, topicId: string, questionId: string) => ({
    list: () =>
      api.get(`/sample-papers/${paperId}/subjects/${subjectId}/topics/${topicId}/questions/${questionId}/options`),
    create: (data: { optionText: string; isCorrect?: boolean; orderIndex?: number }) =>
      api.post(`/sample-papers/${paperId}/subjects/${subjectId}/topics/${topicId}/questions/${questionId}/options`, data),
    update: (optionId: string, data: { optionText?: string; isCorrect?: boolean; orderIndex?: number }) =>
      api.patch(`/sample-papers/${paperId}/subjects/${subjectId}/topics/${topicId}/questions/${questionId}/options/${optionId}`, data),
    delete: (optionId: string) =>
      api.delete(`/sample-papers/${paperId}/subjects/${subjectId}/topics/${topicId}/questions/${questionId}/options/${optionId}`),
  }),
};

// Interview Prep
export type BulkInterviewPrepSubtopic = { name: string; explanation?: string; orderIndex?: number };
export type BulkInterviewPrepTopic = { name: string; explanation?: string; orderIndex?: number; subtopics?: BulkInterviewPrepSubtopic[] };
export type BulkInterviewPrepJobRole = { name: string; description?: string; topics?: BulkInterviewPrepTopic[] };
export const interviewPrepApi = {
  jobRoles: {
    list: () => api.get('/interview-prep/job-roles'),
    get: (roleId: string) => api.get(`/interview-prep/job-roles/${roleId}`),
    create: (data: { name: string; description?: string }) => api.post('/interview-prep/job-roles', data),
    bulkUpload: (data: { jobRoles: BulkInterviewPrepJobRole[] }) =>
      api.post<{ created: { jobRoles: number }; errors?: { index: number; message: string }[] }>('/interview-prep/bulk', data),
    update: (roleId: string, data: { name?: string; description?: string }) =>
      api.patch(`/interview-prep/job-roles/${roleId}`, data),
    delete: (roleId: string) => api.delete(`/interview-prep/job-roles/${roleId}`),
  },
  topics: (roleId: string) => ({
    list: () => api.get(`/interview-prep/job-roles/${roleId}/topics`),
    create: (data: { name: string; explanation?: string; orderIndex?: number }) =>
      api.post(`/interview-prep/job-roles/${roleId}/topics`, data),
    update: (topicId: string, data: { name?: string; explanation?: string; orderIndex?: number }) =>
      api.patch(`/interview-prep/job-roles/${roleId}/topics/${topicId}`, data),
    delete: (topicId: string) => api.delete(`/interview-prep/job-roles/${roleId}/topics/${topicId}`),
  }),
  subtopics: (roleId: string, topicId: string) => ({
    list: () => api.get(`/interview-prep/job-roles/${roleId}/topics/${topicId}/subtopics`),
    create: (data: { name: string; explanation?: string; orderIndex?: number }) =>
      api.post(`/interview-prep/job-roles/${roleId}/topics/${topicId}/subtopics`, data),
    update: (subtopicId: string, data: { name?: string; explanation?: string; orderIndex?: number }) =>
      api.patch(`/interview-prep/job-roles/${roleId}/topics/${topicId}/subtopics/${subtopicId}`, data),
    delete: (subtopicId: string) =>
      api.delete(`/interview-prep/job-roles/${roleId}/topics/${topicId}/subtopics/${subtopicId}`),
  }),
};

// Blog
export const blogApi = {
  list: () => api.get('/blog/admin/posts'),
  get: (id: string) => api.get(`/blog/admin/posts/${id}`),
  create: (data: Record<string, unknown>) => api.post('/blog/admin/posts', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/blog/admin/posts/${id}`, data),
  delete: (id: string) => api.delete(`/blog/admin/posts/${id}`),
};

// Notifications
export const notificationsApi = {
  list: () => api.get('/notifications'),
  get: (id: string) => api.get(`/notifications/${id}`),
  create: (data: { title: string; body?: string; type?: string }) => api.post('/notifications', data),
  update: (id: string, data: { title?: string; body?: string; type?: string }) =>
    api.patch(`/notifications/${id}`, data),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// Notes (public for reading structure; admin for mutate)
export type BulkUploadNoteItem = { title: string; content: string; orderIndex?: number };
export const notesApi = {
  subjects: () => api.get('/notes/subjects'),
  topics: (subjectId: string) => api.get(`/notes/subjects/${subjectId}/topics`),
  list: (topicId: string) => api.get(`/notes/topics/${topicId}/notes`),
  get: (noteId: string) => api.get(`/notes/notes/${noteId}`),
  create: (topicId: string, data: { slug?: string; title: string; content: string; orderIndex?: number }) =>
    api.post(`/notes/admin/topics/${topicId}/notes`, data),
  bulkUpload: (data: { topicId: string; notes: BulkUploadNoteItem[] }) =>
    api.post<{ created: { count: number }; errors?: { index: number; message: string }[] }>('/notes/admin/bulk', data),
  update: (noteId: string, data: { slug?: string; title?: string; content?: string; orderIndex?: number }) =>
    api.patch(`/notes/admin/notes/${noteId}`, data),
  delete: (noteId: string) => api.delete(`/notes/admin/notes/${noteId}`),
};

// Dashboard
export const dashboardApi = {
  stats: () => api.get('/dashbaord'),
};
