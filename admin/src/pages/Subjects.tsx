import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectsApi } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  examType: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type SubjectRow = { id: string; name: string; examType?: string | null };

export function Subjects() {
  const [modal, setModal] = useState<'create' | null>(null);
  const [editing, setEditing] = useState<SubjectRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubjectRow | null>(null);
  const qc = useQueryClient();
  const toast = useToast();
  const { data: subjects, isLoading, isError, refetch } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.list().then((r) => r.data),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', examType: '' },
  });

  const createMutation = useMutation({
    mutationFn: (d: FormData) => subjectsApi.create({ name: d.name, examType: d.examType || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      setModal(null);
      form.reset();
      toast.success('Subject created');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to create subject');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      subjectsApi.update(id, { name: data.name, examType: data.examType || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      setEditing(null);
      form.reset();
      toast.success('Subject updated');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to update subject');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subjectsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      setDeleteTarget(null);
      toast.success('Subject deleted');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to delete subject');
    },
  });

  if (isLoading && !subjects) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading subjects…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">Subjects</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load subjects</p>
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
        <h1 className="text-2xl font-semibold text-slate-800">Subjects</h1>
        <button
          type="button"
          onClick={() => setModal('create')}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700"
        >
          Add Subject
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white admin-table-wrap">
        <table className="w-full text-left min-w-[400px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Name</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Exam Type</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(subjects ?? []).map((s) => (
              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800">{s.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.examType ?? '—'}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing({ id: s.id, name: s.name, examType: s.examType ?? undefined });
                      form.reset({ name: s.name, examType: s.examType ?? '' });
                    }}
                    className="text-indigo-600 text-sm hover:underline mr-2"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ id: s.id, name: s.name, examType: s.examType })}
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
        {(!subjects || subjects.length === 0) && (
          <p className="px-4 py-8 text-center text-slate-500">No subjects. Create one above.</p>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete subject"
        message={deleteTarget ? <>Are you sure you want to delete &quot;{deleteTarget.name}&quot;? This cannot be undone.</> : null}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Edit Subject</h2>
            <form
              onSubmit={form.handleSubmit((d) =>
                updateMutation.mutate({ id: editing.id, data: d })
              )}
              className="space-y-4"
            >
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Exam Type</label>
                <input
                  {...form.register('examType')}
                  placeholder="e.g. JEE, UPSC"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setEditing(null); form.reset(); }}
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

      {modal === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">New Subject</h2>
            <form
              onSubmit={form.handleSubmit((d) => createMutation.mutate(d))}
              className="space-y-4"
            >
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Exam Type</label>
                <input
                  {...form.register('examType')}
                  placeholder="e.g. JEE, UPSC"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
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
