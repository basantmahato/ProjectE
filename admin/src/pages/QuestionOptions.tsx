import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionOptionsApi, questionBankApi } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';

const schema = z.object({
  questionId: z.string().min(1, 'Select question'),
  optionText: z.string().min(1, 'Option text required'),
  isCorrect: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

type OptionRow = { id: string; questionId: string; optionText: string; isCorrect?: boolean };

export function QuestionOptions() {
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [questionFilter, setQuestionFilter] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; optionText: string } | null>(null);
  const qc = useQueryClient();
  const toast = useToast();
  const { data: questions } = useQuery({
    queryKey: ['question-bank'],
    queryFn: () => questionBankApi.list().then((r) => r.data),
  });
  const { data: options, isLoading, isError, refetch } = useQuery({
    queryKey: ['question-options', questionFilter],
    queryFn: () =>
      questionFilter
        ? questionOptionsApi.byQuestion(questionFilter).then((r) => r.data)
        : questionOptionsApi.list().then((r) => r.data),
    enabled: !!questionFilter || questionFilter === '',
  });
  const { data: editOption } = useQuery({
    queryKey: ['question-options', 'single', editingId],
    queryFn: () => questionOptionsApi.get(editingId!).then((r) => r.data),
    enabled: !!editingId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { questionId: '', optionText: '', isCorrect: false },
  });

  useEffect(() => {
    if (!editingId || !editOption) return;
    const o = editOption as OptionRow;
    form.reset({
      questionId: o.questionId ?? '',
      optionText: o.optionText ?? '',
      isCorrect: o.isCorrect ?? false,
    });
  }, [editingId, editOption, form]);

  const openCreate = () => {
    setEditingId(null);
    form.reset({ questionId: '', optionText: '', isCorrect: false });
    setModal(true);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditingId(null);
  };

  const createMutation = useMutation({
    mutationFn: (d: FormData) =>
      questionOptionsApi.create({
        questionId: d.questionId,
        optionText: d.optionText,
        isCorrect: d.isCorrect,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['question-options'] });
      closeModal();
      toast.success('Option added');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to add option');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      questionOptionsApi.update(id, {
        optionText: data.optionText,
        isCorrect: data.isCorrect,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['question-options'] });
      closeModal();
      toast.success('Option updated');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to update option');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionOptionsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['question-options'] });
      setDeleteTarget(null);
      toast.success('Option deleted');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to delete option');
    },
  });

  const onSubmit = (d: FormData) => {
    if (editingId) updateMutation.mutate({ id: editingId, data: d });
    else createMutation.mutate(d);
  };

  const questionList = Array.isArray(questions) ? questions : [];
  const optionList = Array.isArray(options) ? options : [];
  const filtered = optionList;

  if (isLoading && filtered.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading options…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">Question Options</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load options</p>
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
        <h1 className="text-2xl font-semibold text-slate-800">Question Options</h1>
        <div className="flex gap-2">
          <select
            value={questionFilter}
            onChange={(e) => setQuestionFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All questions</option>
            {questionList.map((q: { id: string; questionText: string }) => (
              <option key={q.id} value={q.id}>{String(q.questionText).slice(0, 50)}...</option>
            ))}
          </select>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Add Option
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white admin-table-wrap">
        <table className="w-full text-left min-w-[500px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Option text</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Correct</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o: OptionRow) => (
              <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800">{o.optionText}</td>
                <td className="px-4 py-3">{o.isCorrect ? <span className="text-green-600 font-medium">Yes</span> : 'No'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button type="button" onClick={() => openEdit(o.id)} className="text-indigo-600 text-sm hover:underline">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ id: o.id, optionText: (o.optionText || '').slice(0, 40) })}
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
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">No options. Add one above.</p>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete option"
        message={deleteTarget ? <>Are you sure you want to delete this option? This cannot be undone.</> : null}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">{editingId ? 'Edit Option' : 'New Option'}</h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Question</label>
                <select
                  {...form.register('questionId')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  disabled={!!editingId}
                >
                  <option value="">Select question</option>
                  {questionList.map((q: { id: string; questionText: string }) => (
                    <option key={q.id} value={q.id}>{String(q.questionText).slice(0, 60)}...</option>
                  ))}
                </select>
                {form.formState.errors.questionId && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.questionId.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Option text</label>
                <input
                  {...form.register('optionText')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                {form.formState.errors.optionText && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.optionText.message}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...form.register('isCorrect')} id="isCorrect" className="rounded border-slate-300" />
                <label htmlFor="isCorrect" className="text-sm text-slate-700">Correct answer</label>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={closeModal} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
