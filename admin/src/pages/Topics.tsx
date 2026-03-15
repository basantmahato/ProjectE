import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { topicsApi, subjectsApi } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';

const schema = z.object({
  subjectId: z.string().min(1, 'Select subject'),
  name: z.string().min(1, 'Name required'),
});

type FormData = z.infer<typeof schema>;

export function Topics() {
  const [modal, setModal] = useState<'create' | null>(null);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const qc = useQueryClient();
  const toast = useToast();
  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.list().then((r) => r.data),
  });
  const { data: topics, isLoading, isError, refetch } = useQuery({
    queryKey: ['topics'],
    queryFn: () => topicsApi.list().then((r) => r.data),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { subjectId: '', name: '' },
  });

  const createMutation = useMutation({
    mutationFn: (d: FormData) => topicsApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['topics'] });
      setModal(null);
      form.reset();
      toast.success('Topic created');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to create topic');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => topicsApi.update(id, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['topics'] });
      setEditing(null);
      toast.success('Topic updated');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to update topic');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => topicsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['topics'] });
      setDeleteTarget(null);
      toast.success('Topic deleted');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to delete topic');
    },
  });

  const subjectMap = new Map((subjects ?? []).map((s) => [s.id, s.name]));

  if (isLoading && !topics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading topics…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">Topics</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load topics</p>
          <button type="button" onClick={() => refetch()} className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Topics</h1>
        <button
          type="button"
          onClick={() => setModal('create')}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700"
        >
          Add Topic
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white admin-table-wrap">
        <table className="w-full text-left min-w-[500px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Name</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Subject</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(topics ?? []).map((t) => (
              <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800">
                  {editing?.id === t.id ? (
                    <input
                      value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      onBlur={() => editing.name && updateMutation.mutate({ id: t.id, name: editing.name })}
                      onKeyDown={(e) => e.key === 'Enter' && editing.name && updateMutation.mutate({ id: t.id, name: editing.name })}
                      className="rounded border border-slate-300 px-2 py-1 w-48"
                      autoFocus
                    />
                  ) : (
                    <span onClick={() => setEditing({ id: t.id, name: t.name })} className="cursor-pointer hover:underline">
                      {t.name}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{subjectMap.get(t.subjectId) ?? t.subjectId}</td>
                <td className="px-4 py-3">
                  {editing?.id !== t.id && (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditing({ id: t.id, name: t.name })}
                        className="text-indigo-600 text-sm hover:underline mr-2"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ id: t.id, name: t.name })}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 text-sm hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!topics || topics.length === 0) && (
          <p className="px-4 py-8 text-center text-slate-500">No topics. Create one above.</p>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete topic"
        message={deleteTarget ? <>Are you sure you want to delete &quot;{deleteTarget.name}&quot;? This cannot be undone.</> : null}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />

      {modal === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">New Topic</h2>
            <form
              onSubmit={form.handleSubmit((d) => createMutation.mutate(d))}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <select
                  {...form.register('subjectId')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="">Select subject</option>
                  {(subjects ?? []).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {form.formState.errors.subjectId && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.subjectId.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  {...form.register('name')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                {form.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
