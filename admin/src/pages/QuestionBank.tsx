import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionBankApi, topicsApi, type BulkUploadPayload } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';

const BULK_JSON_EXAMPLE: BulkUploadPayload = {
  topicId: '',
  questions: [
    {
      questionText: 'What is 2 + 2?',
      difficulty: 'easy',
      marks: 1,
      options: [
        { optionText: '3', isCorrect: false },
        { optionText: '4', isCorrect: true },
      ],
    },
    {
      questionText: 'What is the capital of France?',
      difficulty: 'easy',
      marks: 1,
      explanation: 'Paris is the capital.',
      options: [
        { optionText: 'London', isCorrect: false },
        { optionText: 'Paris', isCorrect: true },
      ],
    },
  ],
};

const schema = z.object({
  topicId: z.string().min(1, 'Select topic'),
  questionText: z.string().min(1, 'Question required'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  marks: z.number().optional(),
  negativeMarks: z.number().optional(),
  explanation: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type QuestionRow = {
  id: string;
  topicId: string;
  questionText: string;
  difficulty?: string;
  marks?: number;
  negativeMarks?: number;
  explanation?: string | null;
};

export function QuestionBank() {
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [topicFilter, setTopicFilter] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; questionText: string } | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkTopicId, setBulkTopicId] = useState('');
  const [bulkJson, setBulkJson] = useState('');
  const [bulkParseError, setBulkParseError] = useState<string | null>(null);
  const qc = useQueryClient();
  const toast = useToast();
  const { data: topics } = useQuery({
    queryKey: ['topics'],
    queryFn: () => topicsApi.list().then((r) => r.data),
  });
  const { data: questions, isLoading, isError, refetch } = useQuery({
    queryKey: ['question-bank', topicFilter],
    queryFn: () =>
      topicFilter
        ? questionBankApi.byTopic(topicFilter).then((r) => r.data)
        : questionBankApi.list().then((r) => r.data),
  });

  const { data: editQuestion } = useQuery({
    queryKey: ['question-bank', 'single', editingId],
    queryFn: () => questionBankApi.get(editingId!).then((r) => r.data),
    enabled: !!editingId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      topicId: '',
      questionText: '',
      difficulty: 'medium',
      marks: 1,
      negativeMarks: 0,
      explanation: '',
    },
  });

  useEffect(() => {
    if (!editingId || !editQuestion) return;
    const q = editQuestion as QuestionRow;
    form.reset({
      topicId: q.topicId ?? '',
      questionText: q.questionText ?? '',
      difficulty: (q.difficulty as 'easy' | 'medium' | 'hard') ?? 'medium',
      marks: q.marks ?? 1,
      negativeMarks: q.negativeMarks ?? 0,
      explanation: q.explanation ?? '',
    });
  }, [editingId, editQuestion, form]);

  const openCreate = () => {
    setEditingId(null);
    form.reset({ topicId: '', questionText: '', difficulty: 'medium', marks: 1, negativeMarks: 0, explanation: '' });
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
      questionBankApi.create({
        topicId: d.topicId,
        questionText: d.questionText,
        difficulty: d.difficulty,
        marks: d.marks,
        negativeMarks: d.negativeMarks,
        explanation: d.explanation,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['question-bank'] });
      closeModal();
      toast.success('Question added');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to add question');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      questionBankApi.update(id, {
        questionText: data.questionText,
        difficulty: data.difficulty,
        marks: data.marks,
        negativeMarks: data.negativeMarks,
        explanation: data.explanation,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['question-bank'] });
      closeModal();
      toast.success('Question updated');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to update question');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionBankApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['question-bank'] });
      setDeleteTarget(null);
      toast.success('Question deleted');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to delete question');
    },
  });

  const bulkUploadMutation = useMutation({
    mutationFn: (payload: BulkUploadPayload) => questionBankApi.bulkUpload(payload),
    onSuccess: (res) => {
      const data = res.data;
      qc.invalidateQueries({ queryKey: ['question-bank'] });
      setBulkModalOpen(false);
      setBulkJson('');
      setBulkTopicId('');
      setBulkParseError(null);
      const msg = data.errors?.length
        ? `Created ${data.created.questions} questions, ${data.created.options} options. ${data.errors.length} item(s) failed.`
        : `Created ${data.created.questions} questions and ${data.created.options} options.`;
      toast.success(msg);
      if (data.errors?.length) {
        data.errors.forEach((e) => toast.error(`Question ${e.index + 1}: ${e.message}`));
      }
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Bulk upload failed');
    },
  });

  const topicMap = new Map((topics ?? []).map((t) => [t.id, t.name]));

  const handleBulkSubmit = () => {
    setBulkParseError(null);
    let payload: BulkUploadPayload;
    try {
      payload = JSON.parse(bulkJson) as BulkUploadPayload;
    } catch {
      setBulkParseError('Invalid JSON. Check syntax.');
      return;
    }
    if (!payload.topicId && bulkTopicId) payload.topicId = bulkTopicId;
    if (!payload.topicId) {
      setBulkParseError('Select a topic or include "topicId" in the JSON.');
      return;
    }
    if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
      setBulkParseError('JSON must have a "questions" array with at least one question.');
      return;
    }
    bulkUploadMutation.mutate(payload);
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        setBulkJson(text);
        setBulkParseError(null);
      } catch {
        setBulkParseError('Could not read file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const onSubmit = (d: FormData) => {
    if (editingId) updateMutation.mutate({ id: editingId, data: d });
    else createMutation.mutate(d);
  };

  const list = Array.isArray(questions) ? questions : [];

  if (isLoading && list.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading questions…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">Question Bank</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load questions</p>
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
        <h1 className="text-2xl font-semibold text-slate-800">Question Bank</h1>
        <div className="flex gap-2">
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All topics</option>
            {(topics ?? []).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Add Question
          </button>
          <button
            type="button"
            onClick={() => { setBulkModalOpen(true); setBulkParseError(null); setBulkJson(''); }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Bulk upload (JSON)
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white admin-table-wrap">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Question</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Topic</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Difficulty</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((q: { id: string; questionText: string; topicId: string; difficulty?: string }) => (
              <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800 max-w-md truncate">{q.questionText}</td>
                <td className="px-4 py-3 text-slate-600">{topicMap.get(q.topicId) ?? q.topicId}</td>
                <td className="px-4 py-3 text-slate-600">{q.difficulty ?? '—'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button type="button" onClick={() => openEdit(q.id)} className="text-indigo-600 text-sm hover:underline">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ id: q.id, questionText: (q.questionText || '').slice(0, 50) })}
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
        {list.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">No questions. Add one above.</p>
        )}
      </div>

      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Bulk upload questions (JSON)</h2>
            <p className="text-sm text-slate-600 mb-2">
              Paste JSON below or upload a .json file. Format: <code className="bg-slate-100 px-1 rounded text-xs">{'{"topicId":"uuid","questions":[...]}'}</code>
            </p>
            <div className="mb-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Topic (for all questions)</label>
              <select
                value={bulkTopicId}
                onChange={(e) => setBulkTopicId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Select topic</option>
                {(topics ?? []).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Or paste / upload JSON</label>
              <label className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 cursor-pointer hover:bg-slate-50">
                Choose file
                <input type="file" accept=".json,application/json" onChange={handleBulkFileChange} className="hidden" />
              </label>
            </div>
            <textarea
              value={bulkJson}
              onChange={(e) => { setBulkJson(e.target.value); setBulkParseError(null); }}
              placeholder={JSON.stringify(BULK_JSON_EXAMPLE, null, 2)}
              rows={14}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
            />
            {bulkParseError && (
              <p className="mt-2 text-sm text-red-600">{bulkParseError}</p>
            )}
            <div className="flex gap-2 justify-end mt-4">
              <button
                type="button"
                onClick={() => { setBulkModalOpen(false); setBulkJson(''); setBulkTopicId(''); setBulkParseError(null); }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkSubmit}
                disabled={bulkUploadMutation.isPending}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {bulkUploadMutation.isPending ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete question"
        message={deleteTarget ? <>Are you sure you want to delete this question? This cannot be undone.</> : null}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">{editingId ? 'Edit Question' : 'New Question'}</h2>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                <select
                  {...form.register('topicId')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  disabled={!!editingId}
                >
                  <option value="">Select topic</option>
                  {(topics ?? []).map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {form.formState.errors.topicId && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.topicId.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Question text</label>
                <textarea
                  {...form.register('questionText')}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                {form.formState.errors.questionText && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.questionText.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                  <select {...form.register('difficulty')} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Marks</label>
                  <input type="number" {...form.register('marks', { valueAsNumber: true })} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Explanation (optional)</label>
                <textarea {...form.register('explanation')} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={closeModal} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
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
