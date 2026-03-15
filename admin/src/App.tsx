import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Subjects } from './pages/Subjects';
import { Topics } from './pages/Topics';
import { QuestionBank } from './pages/QuestionBank';
import { QuestionOptions } from './pages/QuestionOptions';
import { Tests } from './pages/Tests';
import { MockTests } from './pages/MockTests';
import { SamplePapers } from './pages/SamplePapers';
import { InterviewPrep } from './pages/InterviewPrep';
import { Blog } from './pages/Blog';
import { Notifications } from './pages/Notifications';
import { Notes } from './pages/Notes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="topics" element={<Topics />} />
              <Route path="question-bank" element={<QuestionBank />} />
              <Route path="question-options" element={<QuestionOptions />} />
              <Route path="tests" element={<Tests />} />
              <Route path="mock-tests" element={<MockTests />} />
              <Route path="sample-papers" element={<SamplePapers />} />
              <Route path="interview-prep" element={<InterviewPrep />} />
              <Route path="blog" element={<Blog />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="notes" element={<Notes />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
