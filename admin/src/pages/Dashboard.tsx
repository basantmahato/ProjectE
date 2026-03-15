import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { subjectsApi, topicsApi, usersApi, testsApi } from '../lib/api';

function useCount(queryKey: string[], queryFn: () => Promise<unknown[]>) {
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await queryFn();
      return Array.isArray(res) ? res : [];
    },
  });
  return { count: Array.isArray(data) ? data.length : 0, isLoading, isError };
}

export function Dashboard() {
  const usersQ = useCount(['users'], () => usersApi.list().then((r) => (Array.isArray(r.data) ? r.data : [])));
  const subjectsQ = useCount(['subjects'], () => subjectsApi.list().then((r) => (Array.isArray(r.data) ? r.data : [])));
  const topicsQ = useCount(['topics'], () => topicsApi.list().then((r) => (Array.isArray(r.data) ? r.data : [])));
  const testsQ = useCount(['tests'], () => testsApi.list().then((r) => (Array.isArray(r.data) ? r.data : [])));

  const loading = usersQ.isLoading || subjectsQ.isLoading || topicsQ.isLoading || testsQ.isLoading;
  const cards = [
    { label: 'Users', value: usersQ.isError ? '—' : usersQ.count, to: '/users' },
    { label: 'Subjects', value: subjectsQ.isError ? '—' : subjectsQ.count, to: '/subjects' },
    { label: 'Topics', value: topicsQ.isError ? '—' : topicsQ.count, to: '/topics' },
    { label: 'Tests', value: testsQ.isError ? '—' : testsQ.count, to: '/tests' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Dashboard</h1>
      {loading && (
        <p className="text-slate-500 text-sm mb-4">Loading counts…</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, to }) => (
          <Link
            key={to}
            to={to}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow transition"
          >
            <p className="text-slate-500 text-sm">{label}</p>
            <p className="text-2xl font-semibold text-slate-800 mt-1">
              {loading ? '…' : value}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
