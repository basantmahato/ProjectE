import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi, topicsApi, type BulkUploadNoteItem } from '../lib/api';
import { slugify } from '../lib/slug';
import { useToast } from '../contexts/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';

const BULK_JSON_EXAMPLE: { topicId: string; notes: BulkUploadNoteItem[] } = {
  topicId: '',
  notes: [
    { title: 'Note 1', content: 'Content for note 1' },
    { title: 'Note 2', content: 'Content for note 2', orderIndex: 1 },
  ],
};

const schema = z.object({
  topicId: z.string().min(1, 'Select topic'),
  slug: z.string().optional(),
  title: z.string().min(1, 'Title required'),
  content: z.string().min(1, 'Content required'),
  orderIndex: z.number().optional(),
});

type FormData = z.infer<typeof schema>;

type NoteRow = { id: string; topicId?: string; slug?: string; title: string; content?: string; orderIndex?: number };

export function Notes() {
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string>('');
  const [topicId, setTopicId] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkTopicId, setBulkTopicId] = useState('');
  const [bulkJson, setBulkJson] = useState('');
  const [bulkParseError, setBulkParseError] = useState<string | null>(null);
  const qc = useQueryClient();
  const toast = useToast();
  const { data: subjects } = useQuery({
    queryKey: ['notes', 'subjects'],
    queryFn: () => notesApi.subjects().then((r) => r.data),
  });
  const { data: topics } = useQuery({
    queryKey: ['notes', 'topics', subjectId],
    queryFn: () => notesApi.topics(subjectId).then((r) => r.data),
    enabled: !!subjectId,
  });
  const { data: notes } = useQuery({
    queryKey: ['notes', 'list', topicId],
    queryFn: () => notesApi.list(topicId).then((r) => r.data),
    enabled: !!topicId,
  });
  const { data: allTopics } = useQuery({
    queryKey: ['topics'],
    queryFn: () => topicsApi.list().then((r) => r.data),
    enabled: modal,
  });
  const { data: editNote } = useQuery({
    queryKey: ['notes', 'single', editingId],
    queryFn: () => notesApi.get(editingId!).then((r) => r.data),
    enabled: !!editingId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { topicId: '', slug: '', title: '', content: '', orderIndex: 0 },
  });

  useEffect(() => {
    if (!editingId || !editNote) return;
    const n = editNote as NoteRow;
    form.reset({
      topicId: n.topicId ?? '',
      slug: n.slug ?? '',
      title: n.title ?? '',
      content: n.content ?? '',
      orderIndex: n.orderIndex ?? 0,
    });
  }, [editingId, editNote, form]);

  const openCreate = () => {
    setEditingId(null);
    form.reset({ topicId: '', slug: '', title: '', content: '', orderIndex: 0 });
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
    mutationFn: (d: FormData) => notesApi.create(d.topicId, { slug: d.slug?.trim() || undefined, title: d.title, content: d.content, orderIndex: d.orderIndex }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
      closeModal();
      toast.success('Note created');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to create note');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      notesApi.update(id, { slug: data.slug?.trim() || undefined, title: data.title, content: data.content, orderIndex: data.orderIndex }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
      closeModal();
      toast.success('Note updated');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to update note');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (noteId: string) => notesApi.delete(noteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
      setDeleteTarget(null);
      toast.success('Note deleted');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to delete note');
    },
  });

  const { data: allTopicsForBulk } = useQuery({
    queryKey: ['topics'],
    queryFn: () => topicsApi.list().then((r) => r.data),
    enabled: bulkModalOpen,
  });

  const bulkUploadMutation = useMutation({
    mutationFn: (payload: { topicId: string; notes: BulkUploadNoteItem[] }) => notesApi.bulkUpload(payload),
    onSuccess: (res) => {
      const data = res.data;
      qc.invalidateQueries({ queryKey: ['notes'] });
      setBulkModalOpen(false);
      setBulkJson('');
      setBulkTopicId('');
      setBulkParseError(null);
      const msg = data.errors?.length ? `Created ${data.created.count} note(s). ${data.errors.length} failed.` : `Created ${data.created.count} note(s).`;
      toast.success(msg);
      data.errors?.forEach((e) => toast.error(`Note ${e.index + 1}: ${e.message}`));
    },
    onError: (err: { response?: { data?: { message?: string } } }) => toast.error(err.response?.data?.message ?? 'Bulk upload failed'),
  });

  const handleBulkSubmit = () => {
    setBulkParseError(null);
    let payload: { topicId?: string; notes: BulkUploadNoteItem[] };
    try {
      payload = JSON.parse(bulkJson) as { topicId?: string; notes: BulkUploadNoteItem[] };
    } catch {
      setBulkParseError('Invalid JSON. Check syntax.');
      return;
    }
    const topicId = payload.topicId ?? bulkTopicId;
    if (!topicId) {
      setBulkParseError('Select a topic or include "topicId" in the JSON.');
      return;
    }
    if (!Array.isArray(payload.notes) || payload.notes.length === 0) {
      setBulkParseError('JSON must have a "notes" array with at least one item (title, content).');
      return;
    }
    bulkUploadMutation.mutate({ topicId, notes: payload.notes });
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setBulkJson((reader.result as string) ?? ''); setBulkParseError(null); };
    reader.readAsText(file);
    e.target.value = '';
  };

  const onSubmit = (d: FormData) => {
    if (editingId) updateMutation.mutate({ id: editingId, data: d });
    else createMutation.mutate(d);
  };

  const subjectList = Array.isArray(subjects) ? subjects : [];
  const topicList = Array.isArray(topics) ? topics : [];
  const noteList = Array.isArray(notes) ? notes : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Notes</h1>

      <div className="flex gap-4 mb-6 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
          <select
            value={subjectId}
            onChange={(e) => { setSubjectId(e.target.value); setTopicId(''); }}
            className="rounded-lg border border-slate-300 px-3 py-2 min-w-[200px]"
          >
            <option value="">Select subject</option>
            {subjectList.map((s: { id: string; name: string }) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 min-w-[200px]"
          >
            <option value="">Select topic</option>
            {topicList.map((t: { id: string; name: string }) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="button" onClick={openCreate} className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700">
            Add Note
          </button>
          <button type="button" onClick={() => { setBulkModalOpen(true); setBulkParseError(null); setBulkJson(''); }} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 text-sm font-medium hover:bg-slate-50">
            Bulk upload (JSON)
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white admin-table-wrap">
        <table className="w-full text-left min-w-[500px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Title</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {noteList.map((n: NoteRow) => (
              <tr key={n.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800">{n.title}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button type="button" onClick={() => openEdit(n.id)} className="text-indigo-600 text-sm hover:underline">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ id: n.id, title: n.title })}
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
        {topicId && noteList.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">No notes in this topic. Add one above.</p>
        )}
        {!topicId && (
          <p className="px-4 py-8 text-center text-slate-500">Select a subject and topic to view notes.</p>
        )}
      </div>

      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Bulk upload notes (JSON)</h2>
            <p className="text-sm text-slate-600 mb-2">
              Format: <code className="bg-slate-100 px-1 rounded text-xs">{'{"topicId":"uuid","notes":[{ "title":"...", "content":"..." }]}'}</code>
            </p>
            <div className="mb-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Topic (for all notes)</label>
              <select value={bulkTopicId} onChange={(e) => setBulkTopicId(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="">Select topic</option>
                {(Array.isArray(allTopicsForBulk) ? allTopicsForBulk : []).map((t: { id: string; name: string }) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Paste / upload JSON</label>
              <label className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 cursor-pointer hover:bg-slate-50">
                Choose file
                <input type="file" accept=".json,application/json" onChange={handleBulkFileChange} className="hidden" />
              </label>
            </div>
            <textarea value={bulkJson} onChange={(e) => { setBulkJson(e.target.value); setBulkParseError(null); }} placeholder={JSON.stringify(BULK_JSON_EXAMPLE, null, 2)} rows={12} className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm" />
            {bulkParseError && <p className="mt-2 text-sm text-red-600">{bulkParseError}</p>}
            <div className="flex gap-2 justify-end mt-4">
              <button type="button" onClick={() => { setBulkModalOpen(false); setBulkJson(''); setBulkTopicId(''); setBulkParseError(null); }} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={handleBulkSubmit} disabled={bulkUploadMutation.isPending} className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">{bulkUploadMutation.isPending ? 'Uploading…' : 'Upload'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete note"
        message={deleteTarget ? <>Are you sure you want to delete &quot;{deleteTarget.title}&quot;? This cannot be undone.</> : null}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">{editingId ? 'Edit Note' : 'New Note'}</h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                <select {...form.register('topicId')} className="w-full rounded-lg border border-slate-300 px-3 py-2" disabled={!!editingId}>
                  <option value="">Select topic</option>
                  {(Array.isArray(allTopics) ? allTopics : []).map((t: { id: string; name: string }) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {form.formState.errors.topicId && <p className="mt-1 text-sm text-red-600">{form.formState.errors.topicId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input {...form.register('title')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                {form.formState.errors.title && <p className="mt-1 text-sm text-red-600">{form.formState.errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug (optional, for SEO)</label>
                <input
                  {...form.register('slug')}
                  placeholder={slugify(form.watch('title') || '') || 'Leave empty to auto-generate from title'}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                {(form.watch('title') || '').trim() && (
                  <p className="mt-1 text-xs text-slate-500">Preview: {slugify(form.watch('title') || '') || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea {...form.register('content')} rows={5} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                {form.formState.errors.content && <p className="mt-1 text-sm text-red-600">{form.formState.errors.content.message}</p>}
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
