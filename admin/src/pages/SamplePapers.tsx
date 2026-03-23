import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { samplePapersApi, type BulkSamplePaperItem } from '../lib/api';
import { slugify } from '../lib/slug';
import { useToast } from '../contexts/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';

const BULK_JSON_EXAMPLE: { papers: BulkSamplePaperItem[] } = {
  papers: [
    {
      title: 'Sample Paper 1',
      description: 'Optional description',
      subjects: [
        {
          name: 'Physics',
          topics: [
            {
              name: 'Mechanics',
              questions: [
                {
                  questionText: 'What is force?',
                  explanation: 'F=ma',
                  options: [{ optionText: 'Newton', isCorrect: true }],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const schema = z.object({
  slug: z.string().optional(),
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type PaperRow = { id: string; slug?: string; title: string; description?: string | null };
type SubjectRow = { id: string; name: string; orderIndex?: number | null };
type TopicRow = { id: string; name: string; orderIndex?: number | null };
type QuestionRow = { id: string; questionText: string; explanation?: string | null; orderIndex?: number | null };
type OptionRow = { id: string; optionText: string; isCorrect?: boolean | null };

export function SamplePapers() {
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [paperSearch, setPaperSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [bulkParseError, setBulkParseError] = useState<string | null>(null);

  const [subjectModal, setSubjectModal] = useState<{ paperId: string; paperTitle: string; subject?: SubjectRow } | null>(null);
  const [topicModal, setTopicModal] = useState<{
    paperId: string;
    paperTitle: string;
    subjectId: string;
    subjectName: string;
    topic?: TopicRow;
  } | null>(null);
  const [questionModal, setQuestionModal] = useState<{
    paperId: string;
    subjectId: string;
    topicId: string;
    topicName: string;
    question?: QuestionRow;
  } | null>(null);
  const [optionModal, setOptionModal] = useState<{
    paperId: string;
    subjectId: string;
    topicId: string;
    questionId: string;
    questionPreview: string;
    option?: OptionRow;
  } | null>(null);

  const [deleteSubjectTarget, setDeleteSubjectTarget] = useState<{ paperId: string; id: string; name: string } | null>(null);
  const [deleteTopicTarget, setDeleteTopicTarget] = useState<{ paperId: string; subjectId: string; id: string; name: string } | null>(null);
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState<{ paperId: string; subjectId: string; topicId: string; id: string } | null>(null);
  const [deleteOptionTarget, setDeleteOptionTarget] = useState<{ paperId: string; subjectId: string; topicId: string; questionId: string; id: string; text: string } | null>(null);

  const qc = useQueryClient();
  const toast = useToast();

  const { data: papers, isLoading, isError, refetch } = useQuery({
    queryKey: ['sample-papers'],
    queryFn: () => samplePapersApi.list().then((r) => r.data),
  });

  const { data: subjects } = useQuery({
    queryKey: ['sample-papers', selectedPaperId, 'subjects'],
    queryFn: () => samplePapersApi.subjects.list(selectedPaperId!).then((r) => r.data),
    enabled: !!selectedPaperId,
  });

  const { data: editPaper } = useQuery({
    queryKey: ['sample-papers', 'single', editingId],
    queryFn: () => samplePapersApi.get(editingId!).then((r) => r.data),
    enabled: !!editingId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { slug: '', title: '', description: '' },
  });

  const list = (Array.isArray(papers) ? (papers as PaperRow[]) : []) as PaperRow[];
  const filteredPapers = useMemo(() => {
    const q = paperSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        (p.title ?? '').toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q)
    );
  }, [list, paperSearch]);

  const selectedPaper = useMemo(() => list.find((p) => p.id === selectedPaperId) ?? null, [list, selectedPaperId]);
  const subjectList = (Array.isArray(subjects) ? (subjects as SubjectRow[]) : []) as SubjectRow[];

  useEffect(() => {
    if (!editingId || !editPaper) return;
    const p = editPaper as PaperRow;
    form.reset({ slug: p.slug ?? '', title: p.title ?? '', description: p.description ?? '' });
  }, [editingId, editPaper, form]);

  const openCreate = () => {
    setEditingId(null);
    form.reset({ slug: '', title: '', description: '' });
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
    mutationFn: (d: FormData) => samplePapersApi.create({ slug: d.slug?.trim() || undefined, title: d.title, description: d.description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sample-papers'] });
      closeModal();
      toast.success('Sample paper created');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to create sample paper');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      samplePapersApi.update(id, { slug: data.slug?.trim() || undefined, title: data.title, description: data.description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sample-papers'] });
      closeModal();
      toast.success('Sample paper updated');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to update sample paper');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => samplePapersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sample-papers'] });
      setSelectedPaperId(null);
      setDeleteTarget(null);
      toast.success('Sample paper deleted');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to delete sample paper');
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: ({ paperId, id }: { paperId: string; id: string }) => samplePapersApi.subjects.delete(paperId, id),
    onSuccess: (_, { paperId }) => {
      qc.invalidateQueries({ queryKey: ['sample-papers', paperId, 'subjects'] });
      setDeleteSubjectTarget(null);
      toast.success('Subject deleted');
    },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const deleteTopicMutation = useMutation({
    mutationFn: ({ paperId, subjectId, id }: { paperId: string; subjectId: string; id: string }) =>
      samplePapersApi.topics(paperId, subjectId).delete(id),
    onSuccess: (_, { paperId, subjectId }) => {
      qc.invalidateQueries({ queryKey: ['sample-papers', paperId, 'subjects', subjectId, 'topics'] });
      setDeleteTopicTarget(null);
      toast.success('Topic deleted');
    },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: ({ paperId, subjectId, topicId, id }: { paperId: string; subjectId: string; topicId: string; id: string }) =>
      samplePapersApi.questions(paperId, subjectId, topicId).delete(id),
    onSuccess: (_, { paperId, subjectId, topicId }) => {
      qc.invalidateQueries({ queryKey: ['sample-papers', paperId, subjectId, topicId, 'questions'] });
      setDeleteQuestionTarget(null);
      toast.success('Question deleted');
    },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const deleteOptionMutation = useMutation({
    mutationFn: ({ paperId, subjectId, topicId, questionId, id }: { paperId: string; subjectId: string; topicId: string; questionId: string; id: string }) =>
      samplePapersApi.options(paperId, subjectId, topicId, questionId).delete(id),
    onSuccess: (_, { paperId, subjectId, topicId, questionId }) => {
      qc.invalidateQueries({ queryKey: ['sample-papers', paperId, subjectId, topicId, questionId, 'options'] });
      setDeleteOptionTarget(null);
      toast.success('Option deleted');
    },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const bulkUploadMutation = useMutation({
    mutationFn: (payload: { papers: BulkSamplePaperItem[] }) => samplePapersApi.bulkUpload(payload),
    onSuccess: (res) => {
      const data = res.data;
      qc.invalidateQueries({ queryKey: ['sample-papers'] });
      setBulkModalOpen(false);
      setBulkJson('');
      setBulkParseError(null);
      const msg = data.errors?.length ? `Created ${data.created.papers} paper(s). ${data.errors.length} failed.` : `Created ${data.created.papers} paper(s).`;
      toast.success(msg);
      data.errors?.forEach((e) => toast.error(`Paper ${e.index + 1}: ${e.message}`));
    },
    onError: (err: { response?: { data?: { message?: string } } }) => toast.error(err.response?.data?.message ?? 'Bulk upload failed'),
  });

  const handleBulkSubmit = () => {
    setBulkParseError(null);
    let payload: { papers: BulkSamplePaperItem[] };
    try {
      payload = JSON.parse(bulkJson) as { papers: BulkSamplePaperItem[] };
    } catch {
      setBulkParseError('Invalid JSON. Check syntax.');
      return;
    }
    if (!Array.isArray(payload.papers) || payload.papers.length === 0) {
      setBulkParseError('JSON must have a "papers" array with at least one item (each with title and subjects).');
      return;
    }
    bulkUploadMutation.mutate(payload);
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBulkJson((reader.result as string) ?? '');
      setBulkParseError(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const onSubmit = (d: FormData) => {
    if (editingId) updateMutation.mutate({ id: editingId, data: d });
    else createMutation.mutate(d);
  };

  if (isLoading && list.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading sample papers…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">Sample Papers</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load sample papers</p>
          <button type="button" onClick={() => refetch()} className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-slate-800">Sample Papers</h1>
        <div className="flex gap-2">
          <button type="button" onClick={openCreate} className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700">
            Add Paper
          </button>
          <button
            type="button"
            onClick={() => {
              setBulkModalOpen(true);
              setBulkParseError(null);
              setBulkJson('');
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Bulk upload (JSON)
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 gap-4 rounded-xl border border-slate-200 bg-white overflow-hidden">
        {/* Left: Papers list */}
        <aside className="w-72 shrink-0 flex flex-col border-r border-slate-200 bg-slate-50/50">
          <div className="p-3 border-b border-slate-200">
            <input
              type="search"
              placeholder="Search papers…"
              value={paperSearch}
              onChange={(e) => setPaperSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <ul className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredPapers.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSelectedPaperId(p.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedPaperId === p.id ? 'bg-indigo-600 text-white' : 'text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {p.title}
                </button>
              </li>
            ))}
          </ul>
          {filteredPapers.length === 0 && (
            <p className="p-4 text-center text-slate-500 text-sm">{paperSearch.trim() ? 'No papers match your search.' : 'No sample papers yet.'}</p>
          )}
        </aside>

        {/* Right: Paper detail — subjects → topics → questions → options */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {!selectedPaper ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 p-8">
              <div className="text-center max-w-sm">
                <p className="font-medium text-slate-700">Select a sample paper</p>
                <p className="text-sm mt-1">Choose a paper from the list to manage its subjects, topics, questions and options.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="shrink-0 p-4 border-b border-slate-200 bg-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">{selectedPaper.title}</h2>
                    {selectedPaper.description && <p className="text-sm text-slate-600 mt-0.5">{selectedPaper.description}</p>}
                    <p className="text-xs text-slate-500 mt-1">{subjectList.length} subject(s)</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => openEdit(selectedPaper.id)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                      Edit paper
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: selectedPaper.id, title: selectedPaper.title })}
                      disabled={deleteMutation.isPending}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete paper
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Subjects</h3>
                  <button
                    type="button"
                    onClick={() => setSubjectModal({ paperId: selectedPaper.id, paperTitle: selectedPaper.title })}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white text-sm font-medium hover:bg-indigo-700"
                  >
                    + Add subject
                  </button>
                </div>
                {subjectList.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center text-slate-500">
                    <p className="font-medium text-slate-600">No subjects yet</p>
                    <p className="text-sm mt-1">Add a subject to organize topics and questions.</p>
                    <button
                      type="button"
                      onClick={() => setSubjectModal({ paperId: selectedPaper.id, paperTitle: selectedPaper.title })}
                      className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700"
                    >
                      Add first subject
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {subjectList.map((subject) => (
                      <SubjectCard
                        key={subject.id}
                        paperId={selectedPaper.id}
                        subject={subject}
                        onEditSubject={() => setSubjectModal({ paperId: selectedPaper.id, paperTitle: selectedPaper.title, subject })}
                        onDeleteSubject={() => setDeleteSubjectTarget({ paperId: selectedPaper.id, id: subject.id, name: subject.name })}
                        onAddTopic={() => setTopicModal({ paperId: selectedPaper.id, paperTitle: selectedPaper.title, subjectId: subject.id, subjectName: subject.name })}
                        onEditTopic={(topic) =>
                          setTopicModal({ paperId: selectedPaper.id, paperTitle: selectedPaper.title, subjectId: subject.id, subjectName: subject.name, topic })
                        }
                        onDeleteTopic={(topic) =>
                          setDeleteTopicTarget({ paperId: selectedPaper.id, subjectId: subject.id, id: topic.id, name: topic.name })
                        }
                        onAddQuestion={(topic) =>
                          setQuestionModal({ paperId: selectedPaper.id, subjectId: subject.id, topicId: topic.id, topicName: topic.name })
                        }
                        onEditQuestion={(topic, question) =>
                          setQuestionModal({ paperId: selectedPaper.id, subjectId: subject.id, topicId: topic.id, topicName: topic.name, question })
                        }
                        onDeleteQuestion={(topic, question) =>
                          setDeleteQuestionTarget({ paperId: selectedPaper.id, subjectId: subject.id, topicId: topic.id, id: question.id })
                        }
                        onAddOption={(topic, question) =>
                          setOptionModal({
                            paperId: selectedPaper.id,
                            subjectId: subject.id,
                            topicId: topic.id,
                            questionId: question.id,
                            questionPreview: question.questionText.slice(0, 40) + (question.questionText.length > 40 ? '…' : ''),
                          })
                        }
                        onEditOption={(topic, question, option) =>
                          setOptionModal({
                            paperId: selectedPaper.id,
                            subjectId: subject.id,
                            topicId: topic.id,
                            questionId: question.id,
                            questionPreview: question.questionText.slice(0, 40) + '…',
                            option,
                          })
                        }
                        onDeleteOption={(topic, question, option) =>
                          setDeleteOptionTarget({
                            paperId: selectedPaper.id,
                            subjectId: subject.id,
                            topicId: topic.id,
                            questionId: question.id,
                            id: option.id,
                            text: option.optionText,
                          })
                        }
                      />
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Bulk upload modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Bulk upload sample papers (JSON)</h2>
            <p className="text-sm text-slate-600 mb-2">
              Format: <code className="bg-slate-100 px-1 rounded text-xs">{'{"papers":[{ "title":"...", "subjects":[{ "name":"...", "topics":[{ "name":"...", "questions":[...] }] }] }]}'}</code>
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
              onChange={(e) => {
                setBulkJson(e.target.value);
                setBulkParseError(null);
              }}
              placeholder={JSON.stringify(BULK_JSON_EXAMPLE, null, 2)}
              rows={14}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
            />
            {bulkParseError && <p className="mt-2 text-sm text-red-600">{bulkParseError}</p>}
            <div className="flex gap-2 justify-end mt-4">
              <button type="button" onClick={() => { setBulkModalOpen(false); setBulkJson(''); setBulkParseError(null); }} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button type="button" onClick={handleBulkSubmit} disabled={bulkUploadMutation.isPending} className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">
                {bulkUploadMutation.isPending ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete sample paper"
        message={deleteTarget ? <>Are you sure you want to delete &quot;{deleteTarget.title}&quot;? All subjects, topics, questions and options will be removed. This cannot be undone.</> : null}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">{editingId ? 'Edit Sample Paper' : 'New Sample Paper'}</h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea {...form.register('description')} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
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

      {subjectModal && <SubjectModal paperId={subjectModal.paperId} paperTitle={subjectModal.paperTitle} subject={subjectModal.subject} onClose={() => setSubjectModal(null)} onSuccess={() => { qc.invalidateQueries({ queryKey: ['sample-papers', subjectModal.paperId, 'subjects'] }); setSubjectModal(null); }} toast={toast} />}
      {topicModal && <TopicModal paperId={topicModal.paperId} subjectId={topicModal.subjectId} subjectName={topicModal.subjectName} topic={topicModal.topic} onClose={() => setTopicModal(null)} onSuccess={() => { qc.invalidateQueries({ queryKey: ['sample-papers', topicModal.paperId, 'subjects', topicModal.subjectId, 'topics'] }); setTopicModal(null); }} toast={toast} />}
      {questionModal && <QuestionModal paperId={questionModal.paperId} subjectId={questionModal.subjectId} topicId={questionModal.topicId} topicName={questionModal.topicName} question={questionModal.question} onClose={() => setQuestionModal(null)} onSuccess={() => { qc.invalidateQueries({ queryKey: ['sample-papers', questionModal.paperId, questionModal.subjectId, questionModal.topicId, 'questions'] }); setQuestionModal(null); }} toast={toast} />}
      {optionModal && <OptionModal paperId={optionModal.paperId} subjectId={optionModal.subjectId} topicId={optionModal.topicId} questionId={optionModal.questionId} questionPreview={optionModal.questionPreview} option={optionModal.option} onClose={() => setOptionModal(null)} onSuccess={() => { qc.invalidateQueries({ queryKey: ['sample-papers', optionModal.paperId, optionModal.subjectId, optionModal.topicId, optionModal.questionId, 'options'] }); setOptionModal(null); }} toast={toast} />}

      {deleteSubjectTarget && <ConfirmDialog open title="Delete subject" message={<>Are you sure you want to delete &quot;{deleteSubjectTarget.name}&quot;? All topics and questions under it will be removed.</>} confirmLabel="Delete" variant="danger" onConfirm={() => deleteSubjectTarget && deleteSubjectMutation.mutate({ paperId: deleteSubjectTarget.paperId, id: deleteSubjectTarget.id })} onCancel={() => setDeleteSubjectTarget(null)} isLoading={deleteSubjectMutation.isPending} />}
      {deleteTopicTarget && <ConfirmDialog open title="Delete topic" message={deleteTopicTarget ? <>Delete &quot;{deleteTopicTarget.name}&quot;? All questions under it will be removed.</> : null} confirmLabel="Delete" variant="danger" onConfirm={() => deleteTopicTarget && deleteTopicMutation.mutate({ paperId: deleteTopicTarget.paperId, subjectId: deleteTopicTarget.subjectId, id: deleteTopicTarget.id })} onCancel={() => setDeleteTopicTarget(null)} isLoading={deleteTopicMutation.isPending} />}
      {deleteQuestionTarget && <ConfirmDialog open title="Delete question" message="Delete this question and its options?" confirmLabel="Delete" variant="danger" onConfirm={() => deleteQuestionTarget && deleteQuestionMutation.mutate({ paperId: deleteQuestionTarget.paperId, subjectId: deleteQuestionTarget.subjectId, topicId: deleteQuestionTarget.topicId, id: deleteQuestionTarget.id })} onCancel={() => setDeleteQuestionTarget(null)} isLoading={deleteQuestionMutation.isPending} />}
      {deleteOptionTarget && <ConfirmDialog open title="Delete option" message={deleteOptionTarget ? <>Delete &quot;{deleteOptionTarget.text}&quot;?</> : null} confirmLabel="Delete" variant="danger" onConfirm={() => deleteOptionTarget && deleteOptionMutation.mutate({ paperId: deleteOptionTarget.paperId, subjectId: deleteOptionTarget.subjectId, topicId: deleteOptionTarget.topicId, questionId: deleteOptionTarget.questionId, id: deleteOptionTarget.id })} onCancel={() => setDeleteOptionTarget(null)} isLoading={deleteOptionMutation.isPending} />}
    </div>
  );
}

function SubjectCard({
  paperId,
  subject,
  onEditSubject,
  onDeleteSubject,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onAddOption,
  onEditOption,
  onDeleteOption,
}: {
  paperId: string;
  subject: SubjectRow;
  onEditSubject: () => void;
  onDeleteSubject: () => void;
  onAddTopic: () => void;
  onEditTopic: (t: TopicRow) => void;
  onDeleteTopic: (t: TopicRow) => void;
  onAddQuestion: (t: TopicRow) => void;
  onEditQuestion: (t: TopicRow, q: QuestionRow) => void;
  onDeleteQuestion: (t: TopicRow, q: QuestionRow) => void;
  onAddOption: (t: TopicRow, q: QuestionRow) => void;
  onEditOption: (t: TopicRow, q: QuestionRow, o: OptionRow) => void;
  onDeleteOption: (t: TopicRow, q: QuestionRow, o: OptionRow) => void;
}) {
  const { data: topics } = useQuery({
    queryKey: ['sample-papers', paperId, 'subjects', subject.id, 'topics'],
    queryFn: () => samplePapersApi.topics(paperId, subject.id).list().then((r) => r.data),
  });
  const topicList = (Array.isArray(topics) ? (topics as TopicRow[]) : []) as TopicRow[];

  return (
    <li className="rounded-xl border border-slate-200 bg-slate-50/30 overflow-hidden">
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between gap-2">
        <h4 className="font-medium text-slate-800">{subject.name}</h4>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={onAddTopic} className="text-sm text-indigo-600 hover:underline">+ Topic</button>
          <button type="button" onClick={onEditSubject} className="text-sm text-slate-600 hover:underline">Edit</button>
          <button type="button" onClick={onDeleteSubject} className="text-sm text-red-600 hover:underline">Delete</button>
        </div>
      </div>
      <div className="px-4 py-3 space-y-4">
        {topicList.length === 0 ? (
          <p className="text-slate-500 text-sm">No topics. Click &quot;+ Topic&quot; to add one.</p>
        ) : (
          topicList.map((topic) => (
            <TopicCard
              key={topic.id}
              paperId={paperId}
              subjectId={subject.id}
              topic={topic}
              onEditTopic={() => onEditTopic(topic)}
              onDeleteTopic={() => onDeleteTopic(topic)}
              onAddQuestion={() => onAddQuestion(topic)}
              onEditQuestion={(q) => onEditQuestion(topic, q)}
              onDeleteQuestion={(q) => onDeleteQuestion(topic, q)}
              onAddOption={(q) => onAddOption(topic, q)}
              onEditOption={(q, o) => onEditOption(topic, q, o)}
              onDeleteOption={(q, o) => onDeleteOption(topic, q, o)}
            />
          ))
        )}
      </div>
    </li>
  );
}

function TopicCard({
  paperId,
  subjectId,
  topic,
  onEditTopic,
  onDeleteTopic,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onAddOption,
  onEditOption,
  onDeleteOption,
}: {
  paperId: string;
  subjectId: string;
  topic: TopicRow;
  onEditTopic: () => void;
  onDeleteTopic: () => void;
  onAddQuestion: () => void;
  onEditQuestion: (q: QuestionRow) => void;
  onDeleteQuestion: (q: QuestionRow) => void;
  onAddOption: (q: QuestionRow) => void;
  onEditOption: (q: QuestionRow, o: OptionRow) => void;
  onDeleteOption: (q: QuestionRow, o: OptionRow) => void;
}) {
  const { data: questions } = useQuery({
    queryKey: ['sample-papers', paperId, subjectId, topic.id, 'questions'],
    queryFn: () => samplePapersApi.questions(paperId, subjectId, topic.id).list().then((r) => r.data),
  });
  const questionList = (Array.isArray(questions) ? (questions as QuestionRow[]) : []) as QuestionRow[];

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
        <span className="font-medium text-slate-800 text-sm">{topic.name}</span>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={onAddQuestion} className="text-xs text-indigo-600 hover:underline">+ Question</button>
          <button type="button" onClick={onEditTopic} className="text-xs text-slate-600 hover:underline">Edit</button>
          <button type="button" onClick={onDeleteTopic} className="text-xs text-red-600 hover:underline">Delete</button>
        </div>
      </div>
      <ul className="divide-y divide-slate-100">
        {questionList.length === 0 ? (
          <li className="px-3 py-2 text-slate-500 text-sm">No questions. Click &quot;+ Question&quot; to add one.</li>
        ) : (
          questionList.map((question) => (
            <QuestionCard
              key={question.id}
              paperId={paperId}
              subjectId={subjectId}
              topicId={topic.id}
              question={question}
              onEditQuestion={() => onEditQuestion(question)}
              onDeleteQuestion={() => onDeleteQuestion(question)}
              onAddOption={() => onAddOption(question)}
              onEditOption={(o) => onEditOption(question, o)}
              onDeleteOption={(o) => onDeleteOption(question, o)}
            />
          ))
        )}
      </ul>
    </div>
  );
}

function QuestionCard({
  paperId,
  subjectId,
  topicId,
  question,
  onEditQuestion,
  onDeleteQuestion,
  onAddOption,
  onEditOption,
  onDeleteOption,
}: {
  paperId: string;
  subjectId: string;
  topicId: string;
  question: QuestionRow;
  onEditQuestion: () => void;
  onDeleteQuestion: () => void;
  onAddOption: () => void;
  onEditOption: (o: OptionRow) => void;
  onDeleteOption: (o: OptionRow) => void;
}) {
  const { data: options } = useQuery({
    queryKey: ['sample-papers', paperId, subjectId, topicId, question.id, 'options'],
    queryFn: () => samplePapersApi.options(paperId, subjectId, topicId, question.id).list().then((r) => r.data),
  });
  const optionList = (Array.isArray(options) ? (options as OptionRow[]) : []) as OptionRow[];

  return (
    <li className="px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800">{question.questionText}</p>
          {question.explanation && <p className="text-xs text-slate-500 mt-0.5">{question.explanation}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={onAddOption} className="text-xs text-indigo-600 hover:underline">+ Option</button>
          <button type="button" onClick={onEditQuestion} className="text-xs text-slate-600 hover:underline">Edit</button>
          <button type="button" onClick={onDeleteQuestion} className="text-xs text-red-600 hover:underline">Delete</button>
        </div>
      </div>
      <ul className="mt-2 ml-3 space-y-1 border-l-2 border-slate-200 pl-2">
        {optionList.map((o) => (
          <li key={o.id} className="flex items-center justify-between gap-2 text-sm text-slate-700">
            <span>{o.optionText} {o.isCorrect && <span className="text-green-600 text-xs">(correct)</span>}</span>
            <span className="flex gap-2 shrink-0">
              <button type="button" onClick={() => onEditOption(o)} className="text-xs text-indigo-600 hover:underline">Edit</button>
              <button type="button" onClick={() => onDeleteOption(o)} className="text-xs text-red-600 hover:underline">Delete</button>
            </span>
          </li>
        ))}
        {optionList.length === 0 && <li className="text-xs text-slate-500">No options. Add one and mark correct.</li>}
      </ul>
    </li>
  );
}

function SubjectModal({
  paperId,
  paperTitle,
  subject,
  onClose,
  onSuccess,
  toast,
}: {
  paperId: string;
  paperTitle: string;
  subject?: SubjectRow | null;
  onClose: () => void;
  onSuccess: () => void;
  toast: { success: (m: string) => void; error: (m: string) => void };
}) {
  const isEdit = !!subject;
  const [name, setName] = useState(subject?.name ?? '');

  useEffect(() => {
    if (subject) setName(subject.name);
  }, [subject]);

  const createMu = useMutation({
    mutationFn: (n: string) => samplePapersApi.subjects.create(paperId, { name: n }),
    onSuccess: () => { onSuccess(); toast.success('Subject added'); },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Failed'),
  });
  const updateMu = useMutation({
    mutationFn: (n: string) => samplePapersApi.subjects.update(paperId, subject!.id, { name: n }),
    onSuccess: () => { onSuccess(); toast.success('Subject updated'); },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const submit = () => {
    const n = name.trim();
    if (!n) return;
    if (isEdit) updateMu.mutate(n);
    else createMu.mutate(n);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">{isEdit ? `Edit subject · ${paperTitle}` : `Add subject to ${paperTitle}`}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="e.g. Physics" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={submit} disabled={createMu.isPending || updateMu.isPending || !name.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">{isEdit ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopicModal({
  paperId,
  subjectId,
  subjectName,
  topic,
  onClose,
  onSuccess,
  toast,
}: {
  paperId: string;
  subjectId: string;
  subjectName: string;
  topic?: TopicRow | null;
  onClose: () => void;
  onSuccess: () => void;
  toast: { success: (m: string) => void; error: (m: string) => void };
}) {
  const isEdit = !!topic;
  const [name, setName] = useState(topic?.name ?? '');
  useEffect(() => { if (topic) setName(topic.name); }, [topic]);

  const createMu = useMutation({
    mutationFn: (n: string) => samplePapersApi.topics(paperId, subjectId).create({ name: n }),
    onSuccess: () => { onSuccess(); toast.success('Topic added'); },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Failed'),
  });
  const updateMu = useMutation({
    mutationFn: (n: string) => samplePapersApi.topics(paperId, subjectId).update(topic!.id, { name: n }),
    onSuccess: () => { onSuccess(); toast.success('Topic updated'); },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const submit = () => {
    const n = name.trim();
    if (!n) return;
    if (isEdit) updateMu.mutate(n);
    else createMu.mutate(n);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">{isEdit ? `Edit topic · ${subjectName}` : `Add topic to ${subjectName}`}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="e.g. Mechanics" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={submit} disabled={createMu.isPending || updateMu.isPending || !name.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">{isEdit ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionModal({
  paperId,
  subjectId,
  topicId,
  topicName,
  question,
  onClose,
  onSuccess,
  toast,
}: {
  paperId: string;
  subjectId: string;
  topicId: string;
  topicName: string;
  question?: QuestionRow | null;
  onClose: () => void;
  onSuccess: () => void;
  toast: { success: (m: string) => void; error: (m: string) => void };
}) {
  const isEdit = !!question;
  const [questionText, setQuestionText] = useState(question?.questionText ?? '');
  const [explanation, setExplanation] = useState(question?.explanation ?? '');
  useEffect(() => {
    if (question) { setQuestionText(question.questionText); setExplanation(question.explanation ?? ''); }
  }, [question]);

  const createMu = useMutation({
    mutationFn: () => samplePapersApi.questions(paperId, subjectId, topicId).create({ questionText: questionText.trim(), explanation: explanation.trim() || undefined }),
    onSuccess: () => { onSuccess(); toast.success('Question added'); },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Failed'),
  });
  const updateMu = useMutation({
    mutationFn: () => samplePapersApi.questions(paperId, subjectId, topicId).update(question!.id, { questionText: questionText.trim(), explanation: explanation.trim() || undefined }),
    onSuccess: () => { onSuccess(); toast.success('Question updated'); },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const submit = () => {
    if (!questionText.trim()) return;
    if (isEdit) updateMu.mutate();
    else createMu.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">{isEdit ? `Edit question · ${topicName}` : `Add question to ${topicName}`}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Question text</label>
            <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes / explanation (optional)</label>
            <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={submit} disabled={createMu.isPending || updateMu.isPending || !questionText.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">{isEdit ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionModal({
  paperId,
  subjectId,
  topicId,
  questionId,
  questionPreview,
  option,
  onClose,
  onSuccess,
  toast,
}: {
  paperId: string;
  subjectId: string;
  topicId: string;
  questionId: string;
  questionPreview: string;
  option?: OptionRow | null;
  onClose: () => void;
  onSuccess: () => void;
  toast: { success: (m: string) => void; error: (m: string) => void };
}) {
  const isEdit = !!option;
  const [optionText, setOptionText] = useState(option?.optionText ?? '');
  const [isCorrect, setIsCorrect] = useState(!!option?.isCorrect);
  useEffect(() => {
    if (option) { setOptionText(option.optionText); setIsCorrect(!!option.isCorrect); }
  }, [option]);

  const createMu = useMutation({
    mutationFn: () => samplePapersApi.options(paperId, subjectId, topicId, questionId).create({ optionText: optionText.trim(), isCorrect }),
    onSuccess: () => { onSuccess(); toast.success('Option added'); },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Failed'),
  });
  const updateMu = useMutation({
    mutationFn: () => samplePapersApi.options(paperId, subjectId, topicId, questionId).update(option!.id, { optionText: optionText.trim(), isCorrect }),
    onSuccess: () => { onSuccess(); toast.success('Option updated'); },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const submit = () => {
    if (!optionText.trim()) return;
    if (isEdit) updateMu.mutate();
    else createMu.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">{isEdit ? 'Edit option' : 'Add option'}</h2>
        <p className="text-xs text-slate-500 mb-3">Question: {questionPreview}</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Option text</label>
            <input value={optionText} onChange={(e) => setOptionText(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isCorrect} onChange={(e) => setIsCorrect(e.target.checked)} />
            <span className="text-sm text-slate-700">Correct answer</span>
          </label>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={submit} disabled={createMu.isPending || updateMu.isPending || !optionText.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">{isEdit ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
