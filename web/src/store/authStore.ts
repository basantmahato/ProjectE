import { create } from "zustand";
import {
  persist,
  type PersistOptions,
  type PersistStorage,
  type StorageValue,
} from "zustand/middleware";

const TOKEN_KEY = "edusaas_token";

type PersistedAuth = { token: string | null };

const authStorage: PersistStorage<PersistedAuth> = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { state: { token }, version: 0 } : null;
  },
  setItem: (name, value: StorageValue<PersistedAuth>) => {
    const token = value.state?.token;
    if (token != null) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  },
  removeItem: (name) => {
    localStorage.removeItem(TOKEN_KEY);
  },
};

type AuthState = {
  token: string | null;
  setToken: (token: string) => void;
  removeToken: () => void;
  isLoggedIn: () => boolean;
};

const persistOptions: PersistOptions<AuthState, { token: string | null }> = {
  name: "edusaas-auth",
  partialize: (s) => ({ token: s.token }),
  storage: authStorage,
};

export const useAuthStore = create<AuthState>()(
  persist((set, get) => ({
    token: null,
    setToken: (token) => set({ token }),
    removeToken: () => set({ token: null }),
    isLoggedIn: () => !!get().token,
  }), persistOptions)
);
