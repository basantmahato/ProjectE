import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, type UserRow } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';

const createSchema = z.object({
  email: z.string().min(1, 'Email required').email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
  role: z.enum(['user', 'admin']),
  plan: z.enum(['free', 'basic', 'premium']),
});

const updateSchema = z.object({
  email: z.string().min(1, 'Email required').email('Invalid email'),
  password: z.union([z.string().length(0), z.string().min(6, 'Min 6 characters')]).optional(),
  name: z.string().optional(),
  role: z.enum(['user', 'admin']),
  plan: z.enum(['free', 'basic', 'premium']),
});

type CreateFormData = z.infer<typeof createSchema>;
type UpdateFormData = z.infer<typeof updateSchema>;

function normalizeUsersPayload(data: unknown): UserRow[] {
  if (Array.isArray(data)) return data as UserRow[];
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data as UserRow[];
    if (Array.isArray(o.users)) return o.users as UserRow[];
  }
  return [];
}

export function Users() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | null>(null);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await usersApi.list();
      const raw = res?.data;
      return normalizeUsersPayload(raw);
    },
  });

  const rawUsers = normalizeUsersPayload(data);
  const users = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rawUsers;
    return rawUsers.filter(
      (u) =>
        (u.email ?? '').toLowerCase().includes(q) ||
        (u.name ?? '').toLowerCase().includes(q)
    );
  }, [rawUsers, search]);

  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: { email: '', password: '', name: '', role: 'user', plan: 'free' },
  });

  const updateForm = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: { email: '', password: '', name: '', role: 'user', plan: 'free' },
  });

  const createMutation = useMutation({
    mutationFn: (d: CreateFormData) =>
      usersApi.create({
        email: d.email,
        password: d.password,
        name: d.name || undefined,
        role: d.role,
        plan: d.plan,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setModal(null);
      createForm.reset();
      toast.success('User created');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to create user');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFormData }) =>
      usersApi.update(id, {
        email: data.email,
        name: data.name || undefined,
        role: data.role,
        plan: data.plan,
        ...(data.password && data.password.length >= 6 ? { password: data.password } : {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setEditing(null);
      updateForm.reset();
      toast.success('User updated');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to update user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setDeleteTarget(null);
      toast.success('User deleted');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to delete user');
    },
  });

  const openEdit = (u: UserRow) => {
    setEditing(u);
    updateForm.reset({
      email: u.email ?? '',
      password: '',
      name: u.name ?? '',
      role: (u.role as 'user' | 'admin') ?? 'user',
      plan: (u.plan as 'free' | 'basic' | 'premium') ?? 'free',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading users...</div>
      </div>
    );
  }

  if (isError) {
    const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
    const message =
      err?.response?.data?.message ||
      (err?.response?.status === 401 ? 'Please log in again.' : undefined) ||
      (err?.response?.status === 403 ? 'You do not have permission to view users.' : undefined) ||
      (error instanceof Error ? error.message : String(error));
    return (
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">Users</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load users</p>
          <p className="text-sm mt-1">{message}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Users</h1>
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Search by email or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={() => setModal('create')}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700 shrink-0"
          >
            Add User
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white admin-table-wrap">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Email</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Name</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Role</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Plan</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Total Marks</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Created</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800">{u.email ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{u.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                    {u.role ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{u.plan ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{u.totalMarks ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 text-sm">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => openEdit(u)}
                    className="text-indigo-600 text-sm hover:underline mr-2"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(u)}
                    disabled={deleteMutation.isPending}
                    className="text-red-600 text-sm hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">
            {search.trim() ? 'No users match your search.' : 'No users yet.'}
          </p>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete user"
        message={deleteTarget ? <>Are you sure you want to delete &quot;{deleteTarget.email}&quot;? This cannot be undone.</> : null}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />

      {modal === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">New User</h2>
            <form
              onSubmit={createForm.handleSubmit((d) => createMutation.mutate(d))}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  {...createForm.register('email')}
                  type="email"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                {createForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  {...createForm.register('password')}
                  type="password"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                {createForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.password.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input {...createForm.register('name')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select {...createForm.register('role')} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
                <select {...createForm.register('plan')} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Edit User</h2>
            <form
              onSubmit={updateForm.handleSubmit((d) =>
                updateMutation.mutate({ id: editing.id, data: d })
              )}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  {...updateForm.register('email')}
                  type="email"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                {updateForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New password (leave blank to keep)</label>
                <input
                  {...updateForm.register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                {updateForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.password.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input {...updateForm.register('name')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select {...updateForm.register('role')} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
                <select {...updateForm.register('plan')} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
