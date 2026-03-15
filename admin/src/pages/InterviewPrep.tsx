import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewPrepApi, type BulkInterviewPrepJobRole } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';

const BULK_JSON_EXAMPLE: { jobRoles: BulkInterviewPrepJobRole[] } = {
  jobRoles: [
    { name: 'Frontend Developer', description: 'React, CSS', topics: [{ name: 'React', subtopics: [{ name: 'Hooks' }] }] },
  ],
};

const jobRoleSchema = z.object({
  name: z.string().min(1, 'Name required'),
  description: z.string().optional(),
});

type JobRoleForm = z.infer<typeof jobRoleSchema>;

type RoleRow = { id: string; name: string; description?: string | null };
type TopicRow = { id: string; name: string; explanation?: string | null };
type SubtopicRow = { id: string; name: string; explanation?: string | null };

export function InterviewPrep() {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [roleSearch, setRoleSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [topicModal, setTopicModal] = useState<{ roleId: string; roleName: string; topic?: TopicRow } | null>(null);
  const [deleteRoleTarget, setDeleteRoleTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteTopicTarget, setDeleteTopicTarget] = useState<{ roleId: string; roleName: string; id: string; name: string } | null>(null);
  const [subtopicModal, setSubtopicModal] = useState<{ roleId: string; roleName: string; topicId: string; topicName: string; subtopic?: SubtopicRow } | null>(null);
  const [deleteSubtopicTarget, setDeleteSubtopicTarget] = useState<{ roleId: string; topicId: string; id: string; name: string } | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [bulkParseError, setBulkParseError] = useState<string | null>(null);

  const qc = useQueryClient();
  const toast = useToast();

  const { data: jobRoles, isLoading, isError, refetch } = useQuery({
    queryKey: ['interview-prep', 'job-roles'],
    queryFn: () => interviewPrepApi.jobRoles.list().then((r) => r.data),
  });

  const { data: topics } = useQuery({
    queryKey: ['interview-prep', 'topics', selectedRoleId],
    queryFn: () => interviewPrepApi.topics(selectedRoleId!).list().then((r) => r.data),
    enabled: !!selectedRoleId,
  });

  const { data: editRole } = useQuery({
    queryKey: ['interview-prep', 'role', editingRoleId],
    queryFn: () => interviewPrepApi.jobRoles.get(editingRoleId!).then((r) => r.data),
    enabled: !!editingRoleId,
  });

  const form = useForm<JobRoleForm>({
    resolver: zodResolver(jobRoleSchema),
    defaultValues: { name: '', description: '' },
  });

  const roleList = (Array.isArray(jobRoles) ? (jobRoles as RoleRow[]) : []) as RoleRow[];
  const filteredRoles = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    if (!q) return roleList;
    return roleList.filter(
      (r) =>
        (r.name ?? '').toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q)
    );
  }, [roleList, roleSearch]);

  const selectedRole = useMemo(() => roleList.find((r) => r.id === selectedRoleId) ?? null, [roleList, selectedRoleId]);

  const topicList = (Array.isArray(topics) ? (topics as TopicRow[]) : []) as TopicRow[];

  useEffect(() => {
    if (!editingRoleId || !editRole) return;
    const r = editRole as RoleRow;
    form.reset({ name: r.name ?? '', description: r.description ?? '' });
  }, [editingRoleId, editRole, form]);

  const openCreateRole = () => {
    setEditingRoleId(null);
    form.reset({ name: '', description: '' });
    setModal(true);
  };

  const openEditRole = (id: string) => {
    setEditingRoleId(id);
    setModal(true);
  };

  const closeRoleModal = () => {
    setModal(false);
    setEditingRoleId(null);
  };

  const createRoleMutation = useMutation({
    mutationFn: (d: JobRoleForm) => interviewPrepApi.jobRoles.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interview-prep'] });
      closeRoleModal();
      toast.success('Job role created');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to create job role');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: JobRoleForm }) =>
      interviewPrepApi.jobRoles.update(id, { name: data.name, description: data.description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interview-prep'] });
      closeRoleModal();
      toast.success('Job role updated');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to update job role');
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => interviewPrepApi.jobRoles.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interview-prep'] });
      if (selectedRoleId) setSelectedRoleId(null);
      setDeleteRoleTarget(null);
      toast.success('Job role deleted');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to delete job role');
    },
  });

  const onRoleSubmit = (d: JobRoleForm) => {
    if (editingRoleId) updateRoleMutation.mutate({ id: editingRoleId, data: d });
    else createRoleMutation.mutate(d);
  };

  const deleteTopicMutation = useMutation({
    mutationFn: ({ roleId, topicId }: { roleId: string; topicId: string }) =>
      interviewPrepApi.topics(roleId).delete(topicId),
    onSuccess: (_, { roleId }) => {
      qc.invalidateQueries({ queryKey: ['interview-prep', 'topics', roleId] });
      setDeleteTopicTarget(null);
      toast.success('Topic deleted');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to delete topic');
    },
  });

  const deleteSubtopicMutation = useMutation({
    mutationFn: ({ roleId, topicId, subtopicId }: { roleId: string; topicId: string; subtopicId: string }) =>
      interviewPrepApi.subtopics(roleId, topicId).delete(subtopicId),
    onSuccess: (_, { roleId, topicId }) => {
      qc.invalidateQueries({ queryKey: ['interview-prep', 'subtopics', roleId, topicId] });
      setDeleteSubtopicTarget(null);
      toast.success('Subtopic deleted');
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message ?? 'Failed to delete subtopic'),
  });

  const bulkUploadMutation = useMutation({
    mutationFn: (payload: { jobRoles: BulkInterviewPrepJobRole[] }) => interviewPrepApi.jobRoles.bulkUpload(payload),
    onSuccess: (res) => {
      const data = res.data;
      qc.invalidateQueries({ queryKey: ['interview-prep'] });
      setBulkModalOpen(false);
      setBulkJson('');
      setBulkParseError(null);
      const msg = data.errors?.length ? `Created ${data.created.jobRoles} job role(s). ${data.errors.length} failed.` : `Created ${data.created.jobRoles} job role(s).`;
      toast.success(msg);
      data.errors?.forEach((e) => toast.error(`Item ${e.index + 1}: ${e.message}`));
    },
    onError: (err: { response?: { data?: { message?: string } } }) => toast.error(err.response?.data?.message ?? 'Bulk upload failed'),
  });

  const handleBulkSubmit = () => {
    setBulkParseError(null);
    let payload: { jobRoles: BulkInterviewPrepJobRole[] };
    try {
      payload = JSON.parse(bulkJson) as { jobRoles: BulkInterviewPrepJobRole[] };
    } catch {
      setBulkParseError('Invalid JSON. Check syntax.');
      return;
    }
    if (!Array.isArray(payload.jobRoles) || payload.jobRoles.length === 0) {
      setBulkParseError('JSON must have a "jobRoles" array with at least one item.');
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

  if (isLoading && roleList.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading job roles…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">Interview Prep</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load job roles</p>
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
        <h1 className="text-2xl font-semibold text-slate-800">Interview Prep</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openCreateRole}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Add Job Role
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
        {/* Left: Job roles list */}
        <aside className="w-72 shrink-0 flex flex-col border-r border-slate-200 bg-slate-50/50">
          <div className="p-3 border-b border-slate-200">
            <input
              type="search"
              placeholder="Search job roles…"
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <ul className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredRoles.map((role) => (
              <li key={role.id}>
                <button
                  type="button"
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedRoleId === role.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {role.name}
                </button>
              </li>
            ))}
          </ul>
          {filteredRoles.length === 0 && (
            <p className="p-4 text-center text-slate-500 text-sm">
              {roleSearch.trim() ? 'No roles match your search.' : 'No job roles yet.'}
            </p>
          )}
        </aside>

        {/* Right: Role detail — topics & subtopics */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {!selectedRole ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 p-8">
              <div className="text-center max-w-sm">
                <p className="font-medium text-slate-700">Select a job role</p>
                <p className="text-sm mt-1">Choose a role from the list to manage its topics and subtopics.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="shrink-0 p-4 border-b border-slate-200 bg-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">{selectedRole.name}</h2>
                    {selectedRole.description && (
                      <p className="text-sm text-slate-600 mt-0.5">{selectedRole.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">{topicList.length} topic(s)</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditRole(selectedRole.id)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Edit role
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteRoleTarget({ id: selectedRole.id, name: selectedRole.name })}
                      disabled={deleteRoleMutation.isPending}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete role
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Topics</h3>
                  <button
                    type="button"
                    onClick={() => setTopicModal({ roleId: selectedRole.id, roleName: selectedRole.name })}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white text-sm font-medium hover:bg-indigo-700"
                  >
                    + Add topic
                  </button>
                </div>
                {topicList.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center text-slate-500">
                    <p className="font-medium text-slate-600">No topics yet</p>
                    <p className="text-sm mt-1">Add a topic to organize subtopics for this role.</p>
                    <button
                      type="button"
                      onClick={() => setTopicModal({ roleId: selectedRole.id, roleName: selectedRole.name })}
                      className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700"
                    >
                      Add first topic
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {topicList.map((topic) => (
                      <TopicCard
                        key={topic.id}
                        roleId={selectedRole.id}
                        roleName={selectedRole.name}
                        topic={topic}
                        onEditTopic={() => setTopicModal({ roleId: selectedRole.id, roleName: selectedRole.name, topic })}
                        onDeleteTopic={() =>
                          setDeleteTopicTarget({
                            roleId: selectedRole.id,
                            roleName: selectedRole.name,
                            id: topic.id,
                            name: topic.name,
                          })
                        }
                        onAddSubtopic={() =>
                          setSubtopicModal({
                            roleId: selectedRole.id,
                            roleName: selectedRole.name,
                            topicId: topic.id,
                            topicName: topic.name,
                          })
                        }
                        onEditSubtopic={(subtopic) =>
                          setSubtopicModal({
                            roleId: selectedRole.id,
                            roleName: selectedRole.name,
                            topicId: topic.id,
                            topicName: topic.name,
                            subtopic,
                          })
                        }
                        onDeleteSubtopic={(subtopic) =>
                          setDeleteSubtopicTarget({
                            roleId: selectedRole.id,
                            topicId: topic.id,
                            id: subtopic.id,
                            name: subtopic.name,
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
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Bulk upload job roles (JSON)</h2>
            <p className="text-sm text-slate-600 mb-2">
              Format: <code className="bg-slate-100 px-1 rounded text-xs">{'{"jobRoles":[{ "name":"...", "topics":[{ "name":"...", "subtopics":[{ "name":"..." }] }] }]}'}</code>
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
              rows={12}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
            />
            {bulkParseError && <p className="mt-2 text-sm text-red-600">{bulkParseError}</p>}
            <div className="flex gap-2 justify-end mt-4">
              <button
                type="button"
                onClick={() => {
                  setBulkModalOpen(false);
                  setBulkJson('');
                  setBulkParseError(null);
                }}
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
        open={!!deleteRoleTarget}
        title="Delete job role"
        message={deleteRoleTarget ? <>Are you sure you want to delete &quot;{deleteRoleTarget.name}&quot;? All topics and subtopics will be removed. This cannot be undone.</> : null}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteRoleTarget && deleteRoleMutation.mutate(deleteRoleTarget.id)}
        onCancel={() => setDeleteRoleTarget(null)}
        isLoading={deleteRoleMutation.isPending}
      />

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">{editingRoleId ? 'Edit Job Role' : 'New Job Role'}</h2>
            {editingRoleId && !editRole ? (
              <p className="text-slate-500 py-4">Loading…</p>
            ) : (
              <form onSubmit={form.handleSubmit(onRoleSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input {...form.register('name')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                  {form.formState.errors.name && <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea {...form.register('description')} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={closeRoleModal} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {editingRoleId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {topicModal && (
        <TopicModal
          roleId={topicModal.roleId}
          roleName={topicModal.roleName}
          topic={topicModal.topic}
          onClose={() => setTopicModal(null)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['interview-prep', 'topics', topicModal.roleId] });
            setTopicModal(null);
          }}
          toast={toast}
        />
      )}

      {subtopicModal && (
        <SubtopicModal
          roleId={subtopicModal.roleId}
          roleName={subtopicModal.roleName}
          topicId={subtopicModal.topicId}
          topicName={subtopicModal.topicName}
          subtopic={subtopicModal.subtopic}
          onClose={() => setSubtopicModal(null)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['interview-prep', 'subtopics', subtopicModal.roleId, subtopicModal.topicId] });
            setSubtopicModal(null);
          }}
          toast={toast}
        />
      )}

      {deleteSubtopicTarget && (
        <ConfirmDialog
          open={!!deleteSubtopicTarget}
          title="Delete subtopic"
          message={deleteSubtopicTarget ? <>Are you sure you want to delete &quot;{deleteSubtopicTarget.name}&quot;?</> : null}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() =>
            deleteSubtopicTarget &&
            deleteSubtopicMutation.mutate({
              roleId: deleteSubtopicTarget.roleId,
              topicId: deleteSubtopicTarget.topicId,
              subtopicId: deleteSubtopicTarget.id,
            })
          }
          onCancel={() => setDeleteSubtopicTarget(null)}
          isLoading={deleteSubtopicMutation.isPending}
        />
      )}

      {deleteTopicTarget && (
        <ConfirmDialog
          open={!!deleteTopicTarget}
          title="Delete topic"
          message={deleteTopicTarget ? <>Are you sure you want to delete &quot;{deleteTopicTarget.name}&quot;? All subtopics under it will be removed. This cannot be undone.</> : null}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => deleteTopicTarget && deleteTopicMutation.mutate({ roleId: deleteTopicTarget.roleId, topicId: deleteTopicTarget.id })}
          onCancel={() => setDeleteTopicTarget(null)}
          isLoading={deleteTopicMutation.isPending}
        />
      )}
    </div>
  );
}

/** Fetches and displays subtopics for one topic */
function TopicCard({
  roleId,
  roleName,
  topic,
  onEditTopic,
  onDeleteTopic,
  onAddSubtopic,
  onEditSubtopic,
  onDeleteSubtopic,
}: {
  roleId: string;
  roleName: string;
  topic: TopicRow;
  onEditTopic: () => void;
  onDeleteTopic: () => void;
  onAddSubtopic: () => void;
  onEditSubtopic: (s: SubtopicRow) => void;
  onDeleteSubtopic: (s: SubtopicRow) => void;
}) {
  const { data: subtopics } = useQuery({
    queryKey: ['interview-prep', 'subtopics', roleId, topic.id],
    queryFn: () => interviewPrepApi.subtopics(roleId, topic.id).list().then((r) => r.data),
  });
  const subtopicList = (Array.isArray(subtopics) ? (subtopics as SubtopicRow[]) : []) as SubtopicRow[];

  return (
    <li className="rounded-xl border border-slate-200 bg-slate-50/30 overflow-hidden">
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-medium text-slate-800">{topic.name}</h4>
          {topic.explanation && <p className="text-sm text-slate-600 mt-0.5">{topic.explanation}</p>}
          <p className="text-xs text-slate-500 mt-1">{subtopicList.length} subtopic(s)</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={onAddSubtopic} className="text-sm text-indigo-600 hover:underline">
            + Subtopic
          </button>
          <button type="button" onClick={onEditTopic} className="text-sm text-slate-600 hover:underline">
            Edit
          </button>
          <button type="button" onClick={onDeleteTopic} className="text-sm text-red-600 hover:underline">
            Delete
          </button>
        </div>
      </div>
      <ul className="px-4 py-2 divide-y divide-slate-100">
        {subtopicList.map((s) => (
          <li key={s.id} className="py-2.5 flex items-center justify-between gap-2 first:pt-2">
            <div className="min-w-0">
              <span className="text-sm font-medium text-slate-800">{s.name}</span>
              {s.explanation && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md" title={s.explanation}>{s.explanation}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={() => onEditSubtopic(s)} className="text-xs text-indigo-600 hover:underline">
                Edit
              </button>
              <button type="button" onClick={() => onDeleteSubtopic(s)} className="text-xs text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </li>
        ))}
        {subtopicList.length === 0 && (
          <li className="py-3 text-center text-slate-500 text-sm">No subtopics. Click &quot;+ Subtopic&quot; to add one.</li>
        )}
      </ul>
    </li>
  );
}

function TopicModal({
  roleId,
  roleName,
  topic,
  onClose,
  onSuccess,
  toast,
}: {
  roleId: string;
  roleName: string;
  topic?: TopicRow | null;
  onClose: () => void;
  onSuccess: () => void;
  toast: { success: (m: string) => void; error: (m: string) => void };
}) {
  const isEdit = !!topic;
  const form = useForm({
    defaultValues: { name: topic?.name ?? '', explanation: topic?.explanation ?? '', orderIndex: topic ? 0 : 0 },
  });

  useEffect(() => {
    if (topic) form.reset({ name: topic.name ?? '', explanation: topic.explanation ?? '', orderIndex: 0 });
  }, [topic, form]);

  const createMutation = useMutation({
    mutationFn: (d: { name: string; explanation?: string; orderIndex?: number }) =>
      interviewPrepApi.topics(roleId).create(d),
    onSuccess: () => {
      onSuccess();
      toast.success('Topic added');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to add topic');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (d: { name: string; explanation?: string; orderIndex?: number }) =>
      interviewPrepApi.topics(roleId).update(topic!.id, d),
    onSuccess: () => {
      onSuccess();
      toast.success('Topic updated');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to update topic');
    },
  });

  const onSubmit = (d: { name: string; explanation?: string; orderIndex?: number }) => {
    if (isEdit) updateMutation.mutate(d);
    else createMutation.mutate(d);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {isEdit ? `Edit topic · ${roleName}` : `Add topic to ${roleName}`}
        </h2>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input {...form.register('name')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes / explanation</label>
            <textarea {...form.register('explanation')} rows={2} placeholder="Optional" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">
              {isEdit ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SubtopicModal({
  roleId,
  roleName,
  topicId,
  topicName,
  subtopic,
  onClose,
  onSuccess,
  toast,
}: {
  roleId: string;
  roleName: string;
  topicId: string;
  topicName: string;
  subtopic?: SubtopicRow | null;
  onClose: () => void;
  onSuccess: () => void;
  toast: { success: (m: string) => void; error: (m: string) => void };
}) {
  const isEdit = !!subtopic;
  const form = useForm({
    defaultValues: { name: subtopic?.name ?? '', explanation: subtopic?.explanation ?? '' },
  });

  useEffect(() => {
    if (subtopic) form.reset({ name: subtopic.name ?? '', explanation: subtopic.explanation ?? '' });
  }, [subtopic, form]);

  const createMutation = useMutation({
    mutationFn: (d: { name: string; explanation?: string }) =>
      interviewPrepApi.subtopics(roleId, topicId).create(d),
    onSuccess: () => {
      onSuccess();
      toast.success('Subtopic added');
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message ?? 'Failed to add subtopic'),
  });

  const updateMutation = useMutation({
    mutationFn: (d: { name: string; explanation?: string }) =>
      interviewPrepApi.subtopics(roleId, topicId).update(subtopic!.id, d),
    onSuccess: () => {
      onSuccess();
      toast.success('Subtopic updated');
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message ?? 'Failed to update subtopic'),
  });

  const onSubmit = (d: { name: string; explanation?: string }) => {
    if (isEdit) updateMutation.mutate(d);
    else createMutation.mutate(d);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {isEdit ? `Edit subtopic · ${topicName}` : `Add subtopic to ${topicName}`}
        </h2>
        <p className="text-xs text-slate-500 mb-3">Role: {roleName}</p>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input {...form.register('name')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes / explanation</label>
            <textarea {...form.register('explanation')} rows={2} placeholder="Optional" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">
              {isEdit ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
