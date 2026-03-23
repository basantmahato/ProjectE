import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, unwrapPaginated } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  body: z.string().optional(),
  type: z.enum(['info', 'success', 'warning', 'transaction']).optional(),
});

type FormData = z.infer<typeof schema>;

type NotificationRow = {
  id: string;
  title: string;
  body?: string;
  type?: string;
  createdAt?: string;
};

export function Notifications() {
  const qc = useQueryClient();
  const toast = useToast();
  const [modal, setModal] = useState<'create' | null>(null);
  const [editing, setEditing] = useState<NotificationRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NotificationRow | null>(null);

  const { data: list, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list().then((r) => unwrapPaginated<NotificationRow>(r)),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', body: '', type: 'info' },
  });

  const createMutation = useMutation({
    mutationFn: (d: FormData) =>
      notificationsApi.create({ title: d.title, body: d.body, type: d.type }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      setModal(null);
      form.reset();
      toast.success('Notification sent to all users');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to send notification');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      notificationsApi.update(id, { title: data.title, body: data.body, type: data.type }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      setEditing(null);
      toast.success('Notification updated');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to update notification');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      setDeleteTarget(null);
      toast.success('Notification deleted');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to delete notification');
    },
  });

  const notifications: NotificationRow[] = Array.isArray(list) ? list : [];

  const openEdit = (n: NotificationRow) => {
    setEditing(n);
    form.reset({ title: n.title, body: n.body ?? '', type: (n.type as FormData['type']) ?? 'info' });
  };

  const closeEdit = () => {
    setEditing(null);
    form.reset({ title: '', body: '', type: 'info' });
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading notifications…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">Notifications</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load notifications</p>
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
        <h1 className="text-2xl font-semibold text-slate-800">Notifications</h1>
        <button
          type="button"
          onClick={() => setModal('create')}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700"
        >
          Send notification
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white mb-6 overflow-hidden admin-table-wrap">
        <table className="w-full text-left min-w-[500px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Title</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Body</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Type</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Created</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800 font-medium">{n.title}</td>
                <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{n.body ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="rounded px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700">
                    {n.type ?? 'info'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-sm">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => openEdit(n)}
                    className="text-indigo-600 text-sm hover:underline mr-2"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(n)}
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
        {notifications.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">No notifications yet.</p>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete notification"
        message={
          deleteTarget ? (
            <>
              Are you sure you want to delete &quot;{deleteTarget.title}&quot;? This cannot be undone.
            </>
          ) : null
        }
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />

      {modal === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Send notification</h2>
            <form
              onSubmit={form.handleSubmit((d) => createMutation.mutate(d))}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  {...form.register('title')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                {form.formState.errors.title && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.title.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Body</label>
                <textarea
                  {...form.register('body')}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  {...form.register('type')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="transaction">Transaction</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
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
                  {createMutation.isPending ? 'Sending...' : 'Send to all'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Edit notification</h2>
            <form
              onSubmit={form.handleSubmit((d) =>
                updateMutation.mutate({ id: editing.id, data: d })
              )}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  {...form.register('title')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                {form.formState.errors.title && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.title.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Body</label>
                <textarea
                  {...form.register('body')}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  {...form.register('type')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="transaction">Transaction</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={closeEdit}
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
