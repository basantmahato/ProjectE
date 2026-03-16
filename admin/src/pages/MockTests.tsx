import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockTestsApi, questionBankApi, unwrapPaginated, type BulkUploadMockTestItem } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';

const BULK_JSON_EXAMPLE: { mockTests: BulkUploadMockTestItem[] } = {
  mockTests: [
    { title: 'Mock 1', durationMinutes: 30, totalMarks: 10, isPublished: false },
    { title: 'Mock 2', description: 'Second mock', durationMinutes: 45, totalMarks: 15, questionIds: [] },
  ],
};

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
  durationMinutes: z.number().min(1),
  totalMarks: z.number().min(0),
  isPublished: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

type MockTestRow = { id: string; title: string; description?: string; durationMinutes: number; totalMarks: number; isPublished?: boolean };

export function MockTests() {
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [manageId, setManageId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [bulkParseError, setBulkParseError] = useState<string | null>(null);
  const qc = useQueryClient();
  const toast = useToast();
  const { data: tests, isLoading, isError, refetch } = useQuery({
    queryKey: ['mock-tests'],
    queryFn: () => mockTestsApi.list().then((r) => unwrapPaginated(r as { data: unknown })),
  });
  const { data: testQuestions } = useQuery({
    queryKey: ['mock-tests', manageId, 'questions'],
    queryFn: () => mockTestsApi.getQuestions(manageId!).then((r) => r.data),
    enabled: !!manageId,
  });
  const { data: questions } = useQuery({
    queryKey: ['question-bank'],
    queryFn: () => questionBankApi.list().then((r) => r.data),
  });
  const { data: editTest } = useQuery({
    queryKey: ['mock-tests', 'single', editingId],
    queryFn: () => mockTestsApi.get(editingId!).then((r) => r.data),
    enabled: !!editingId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', durationMinutes: 30, totalMarks: 10, isPublished: false },
  });

  useEffect(() => {
    if (!editingId || !editTest) return;
    const t = editTest as MockTestRow;
    form.reset({
      title: t.title ?? '',
      description: t.description ?? '',
      durationMinutes: t.durationMinutes ?? 30,
      totalMarks: t.totalMarks ?? 10,
      isPublished: t.isPublished ?? false,
    });
  }, [editingId, editTest, form]);

  const openCreate = () => {
    setEditingId(null);
    form.reset({ title: '', description: '', durationMinutes: 30, totalMarks: 10, isPublished: false });
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
      mockTestsApi.create({
        title: d.title,
        description: d.description,
        durationMinutes: d.durationMinutes,
        totalMarks: d.totalMarks,
        isPublished: d.isPublished,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mock-tests'] });
      closeModal();
      toast.success('Mock test created');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to create mock test');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      mockTestsApi.update(id, {
        title: data.title,
        description: data.description,
        durationMinutes: data.durationMinutes,
        totalMarks: data.totalMarks,
        isPublished: data.isPublished,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mock-tests'] });
      closeModal();
      toast.success('Mock test updated');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to update mock test');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mockTestsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mock-tests'] });
      if (manageId) setManageId(null);
      setDeleteTarget(null);
      toast.success('Mock test deleted');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to delete mock test');
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: ({ testId, questionId }: { testId: string; questionId: string }) =>
      mockTestsApi.addQuestion(testId, questionId),
    onSuccess: (_, { testId }) => {
      qc.invalidateQueries({ queryKey: ['mock-tests', testId, 'questions'] });
      toast.success('Question added');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to add question');
    },
  });

  const removeQuestionMutation = useMutation({
    mutationFn: ({ testId, testQuestionId }: { testId: string; testQuestionId: string }) =>
      mockTestsApi.removeQuestion(testId, testQuestionId),
    onSuccess: (_, { testId }) => {
      qc.invalidateQueries({ queryKey: ['mock-tests', testId, 'questions'] });
      toast.success('Question removed');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to remove question');
    },
  });

  const bulkUploadMutation = useMutation({
    mutationFn: (payload: { mockTests: BulkUploadMockTestItem[] }) => mockTestsApi.bulkUpload(payload),
    onSuccess: (res) => {
      const data = res.data;
      qc.invalidateQueries({ queryKey: ['mock-tests'] });
      setBulkModalOpen(false);
      setBulkJson('');
      setBulkParseError(null);
      const msg = data.errors?.length
        ? `Created ${data.created.count} mock test(s). ${data.errors.length} item(s) failed.`
        : `Created ${data.created.count} mock test(s).`;
      toast.success(msg);
      data.errors?.forEach((e) => toast.error(`Item ${e.index + 1}: ${e.message}`));
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Bulk upload failed');
    },
  });

  const handleBulkSubmit = () => {
    setBulkParseError(null);
    let payload: { mockTests: BulkUploadMockTestItem[] };
    try {
      payload = JSON.parse(bulkJson) as { mockTests: BulkUploadMockTestItem[] };
    } catch {
      setBulkParseError('Invalid JSON. Check syntax.');
      return;
    }
    if (!Array.isArray(payload.mockTests) || payload.mockTests.length === 0) {
      setBulkParseError('JSON must have a "mockTests" array with at least one item.');
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
        setBulkJson((reader.result as string) ?? '');
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

  const testList = Array.isArray(tests) ? tests : [];
  const questionList = Array.isArray(questions) ? questions : [];
  const qList = Array.isArray(testQuestions) ? testQuestions : [];

  if (isLoading && testList.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading mock tests…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">Mock Tests</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load mock tests</p>
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
        <h1 className="text-2xl font-semibold text-slate-800">Mock Tests</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Add Mock Test
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
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Title</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Duration</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Marks</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Published</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {testList.map((t: MockTestRow) => (
              <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800">{t.title}</td>
                <td className="px-4 py-3 text-slate-600">{t.durationMinutes} min</td>
                <td className="px-4 py-3 text-slate-600">{t.totalMarks}</td>
                <td className="px-4 py-3">{t.isPublished ? <span className="text-green-600">Yes</span> : 'No'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button type="button" onClick={() => openEdit(t.id)} className="text-indigo-600 text-sm hover:underline">
                    Edit
                  </button>
                  <button type="button" onClick={() => setManageId(t.id)} className="text-indigo-600 text-sm hover:underline">
                    Questions
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ id: t.id, title: t.title })}
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
        {testList.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">No mock tests.</p>
        )}
      </div>

      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Bulk upload mock tests (JSON)</h2>
            <p className="text-sm text-slate-600 mb-2">
              Paste JSON below or upload a .json file. Format: <code className="bg-slate-100 px-1 rounded text-xs">{'{"mockTests":[{ "title":"...", "durationMinutes":30, "totalMarks":10, "questionIds":[] }]}'}</code>
            </p>
            <div className="mb-2 flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Paste / upload JSON</label>
              <label className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 cursor-pointer hover:bg-slate-50">
                Choose file
                <input type="file" accept=".json,application/json" onChange={handleBulkFileChange} className="hidden" />
              </label>
            </div>
            <textarea
              value={bulkJson}
              onChange={(e) => { setBulkJson(e.target.value); setBulkParseError(null); }}
              placeholder={JSON.stringify(BULK_JSON_EXAMPLE, null, 2)}
              rows={12}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
            />
            {bulkParseError && <p className="mt-2 text-sm text-red-600">{bulkParseError}</p>}
            <div className="flex gap-2 justify-end mt-4">
              <button type="button" onClick={() => { setBulkModalOpen(false); setBulkJson(''); setBulkParseError(null); }} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={handleBulkSubmit} disabled={bulkUploadMutation.isPending} className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">
                {bulkUploadMutation.isPending ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete mock test"
        message={deleteTarget ? <>Are you sure you want to delete &quot;{deleteTarget.title}&quot;? This cannot be undone.</> : null}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">{editingId ? 'Edit Mock Test' : 'New Mock Test'}</h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input {...form.register('title')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                {form.formState.errors.title && <p className="mt-1 text-sm text-red-600">{form.formState.errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea {...form.register('description')} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration (min)</label>
                  <input type="number" {...form.register('durationMinutes', { valueAsNumber: true })} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total marks</label>
                  <input type="number" {...form.register('totalMarks', { valueAsNumber: true })} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...form.register('isPublished')} id="pub" className="rounded border-slate-300" />
                <label htmlFor="pub" className="text-sm text-slate-700">Published</label>
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

      {manageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Mock Test Questions</h2>
              <button type="button" onClick={() => setManageId(null)} className="text-slate-500 hover:text-slate-700">Close</button>
            </div>
            <div className="mb-4">
              <select
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-full"
                onChange={(e) => {
                  const id = e.target.value;
                  if (id) addQuestionMutation.mutate({ testId: manageId, questionId: id });
                }}
              >
                <option value="">Add question...</option>
                {questionList.map((q: { id: string; questionText: string }) => (
                  <option key={q.id} value={q.id}>{String(q.questionText).slice(0, 50)}...</option>
                ))}
              </select>
            </div>
            <ul className="space-y-2">
              {qList.map((tq: { id: string; questionText?: string; question?: { questionText?: string } }) => (
                <li key={tq.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                  <span className="text-slate-700 truncate">{tq.question?.questionText ?? tq.questionText ?? tq.id}</span>
                  <button
                    type="button"
                    onClick={() => removeQuestionMutation.mutate({ testId: manageId, testQuestionId: tq.id })}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
