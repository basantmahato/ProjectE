import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../lib/api';

export function Dashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'admin-stats'],
    queryFn: () => dashboardApi.adminStats().then((r) => r.data),
  });

  const cards = [
    { label: 'Users', key: 'users' as const, to: '/users' },
    { label: 'Subjects', key: 'subjects' as const, to: '/subjects' },
    { label: 'Topics', key: 'topics' as const, to: '/topics' },
    { label: 'Questions', key: 'questions' as const, to: '/question-bank' },
    { label: 'Tests', key: 'tests' as const, to: '/tests' },
    { label: 'Mock Tests', key: 'mockTests' as const, to: '/mock-tests' },
    { label: 'Blog Posts', key: 'blogPosts' as const, to: '/blog' },
    { label: 'Notifications', key: 'notifications' as const, to: '/notifications' },
  ];

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">Dashboard</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load dashboard stats</p>
          <button type="button" onClick={() => refetch()} className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Dashboard</h1>
      {isLoading && (
        <p className="text-slate-500 text-sm mb-4">Loading counts…</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, key, to }) => (
          <Link
            key={to}
            to={to}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow transition"
          >
            <p className="text-slate-500 text-sm">{label}</p>
            <p className="text-2xl font-semibold text-slate-800 mt-1">
              {isLoading ? '…' : (data?.[key] ?? 0)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
