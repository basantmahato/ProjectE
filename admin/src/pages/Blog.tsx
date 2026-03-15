import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '../lib/api';
import { slugify } from '../lib/slug';
import { useToast } from '../contexts/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';

const schema = z.object({
  slug: z.string().optional(),
  title: z.string().min(1, 'Title required'),
  content: z.string().min(1, 'Content required'),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  isPublished: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export function Blog() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const qc = useQueryClient();
  const toast = useToast();

  const { data: posts, isLoading, isError, refetch } = useQuery({
    queryKey: ['blog'],
    queryFn: () => blogApi.list().then((r) => r.data),
  });

  const { data: editPost, isLoading: isLoadingEdit } = useQuery({
    queryKey: ['blog', editingId],
    queryFn: () => blogApi.get(editingId!).then((r) => r.data),
    enabled: !!editingId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: '',
      title: '',
      content: '',
      excerpt: '',
      featuredImage: '',
      isPublished: false,
    },
  });

  useEffect(() => {
    if (!editingId || !editPost) return;
    const p = editPost as BlogPost;
    form.reset({
      slug: p.slug ?? '',
      title: p.title ?? '',
      content: p.content ?? '',
      excerpt: p.excerpt ?? '',
      featuredImage: p.featuredImage ?? '',
      isPublished: p.isPublished ?? false,
    });
  }, [editingId, editPost, form]);

  const openCreate = () => {
    setEditingId(null);
    form.reset({
      slug: '',
      title: '',
      content: '',
      excerpt: '',
      featuredImage: '',
      isPublished: false,
    });
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const createMutation = useMutation({
    mutationFn: (d: FormData) =>
      blogApi.create({
        slug: d.slug?.trim() || undefined,
        title: d.title,
        content: d.content,
        excerpt: d.excerpt || undefined,
        featuredImage: d.featuredImage || undefined,
        isPublished: d.isPublished,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog'] });
      closeModal();
      toast.success('Post created');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to create post');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      blogApi.update(id, {
        slug: data.slug,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || undefined,
        featuredImage: data.featuredImage || undefined,
        isPublished: data.isPublished,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog'] });
      closeModal();
      toast.success('Post updated');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to update post');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog'] });
      setDeleteTarget(null);
      toast.success('Post deleted');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to delete post');
    },
  });

  const onSubmit = (d: FormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: d });
    } else {
      createMutation.mutate(d);
    }
  };

  const list = Array.isArray(posts) ? (posts as BlogPost[]) : [];

  if (isLoading && list.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading posts…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">Blog Posts</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load posts</p>
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Blog Posts</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700"
        >
          Add Post
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white admin-table-wrap">
        <table className="w-full text-left min-w-[500px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Title</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Slug</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800">{p.title}</td>
                <td className="px-4 py-3 text-slate-600 font-mono text-sm">{p.slug}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      p.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {p.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(p.id)}
                    className="text-indigo-600 text-sm hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ id: p.id, title: p.title })}
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
          <p className="px-4 py-8 text-center text-slate-500">No posts. Create one above.</p>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete post"
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              {editingId ? 'Edit Post' : 'New Post'}
            </h2>
            {editingId && isLoadingEdit ? (
              <p className="text-slate-500 py-4">Loading post…</p>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Slug (optional, for SEO)</label>
                  <input
                    {...form.register('slug')}
                    placeholder={slugify(form.watch('title') || '') || 'Leave empty to auto-generate from title'}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                  {(form.watch('title') || '').trim() && (
                    <p className="mt-1 text-xs text-slate-500">
                      Preview: {slugify(form.watch('title') || '') || '—'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Excerpt</label>
                  <textarea
                    {...form.register('excerpt')}
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Featured image URL
                  </label>
                  <input
                    {...form.register('featuredImage')}
                    placeholder="https://…"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                  <textarea
                    {...form.register('content')}
                    rows={8}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
                  />
                  {form.formState.errors.content && (
                    <p className="mt-1 text-sm text-red-600">{form.formState.errors.content.message}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...form.register('isPublished')}
                    id="blog-pub"
                    className="rounded border-slate-300"
                  />
                  <label htmlFor="blog-pub" className="text-sm text-slate-700">
                    Published
                  </label>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
