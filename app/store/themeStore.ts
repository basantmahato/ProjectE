import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storageAdapter } from './storage';

export type ThemeMode = 'light' | 'dark';

interface ThemeStore {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export const themeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',

      setTheme: (theme) => set({ theme }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'app-theme-storage', // storage key
      storage: createJSONStorage(() => storageAdapter),
    }
  )
);