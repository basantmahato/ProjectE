import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storageAdapter } from './storage';

export interface BookmarkedBlogItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: string | null;
  updatedAt: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface BlogBookmarkStore {
  ids: string[];
  posts: Record<string, BookmarkedBlogItem>;
  addBookmark: (post: BookmarkedBlogItem) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  getBookmarkedPosts: () => BookmarkedBlogItem[];
}

export const blogBookmarkStore = create<BlogBookmarkStore>()(
  persist(
    (set, get) => ({
      ids: [],
      posts: {},

      addBookmark: (post) =>
        set((state) => {
          if (state.ids.includes(post.id)) return state;
          return {
            ids: [...state.ids, post.id],
            posts: { ...state.posts, [post.id]: post },
          };
        }),

      removeBookmark: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.posts;
          return {
            ids: state.ids.filter((x) => x !== id),
            posts: rest,
          };
        }),

      isBookmarked: (id) => get().ids.includes(id),

      getBookmarkedPosts: () => {
        const { ids, posts } = get();
        return ids.map((id) => posts[id]).filter(Boolean);
      },
    }),
    {
      name: 'app-blog-bookmarks',
      storage: createJSONStorage(() => storageAdapter),
    }
  )
);
