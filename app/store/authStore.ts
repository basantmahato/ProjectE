import api from "@/lib/axios";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerPushTokenIfNeeded } from "@/lib/pushNotifications";

export const ACCESS_TOKEN_KEY = "access_token";
export const USER_KEY = "user";
export const SEEN_NOTIFICATION_IDS_KEY = "seen_notification_ids";

export type PlanId = 'free' | 'basic' | 'premium';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: PlanId;
  createdAt: string;
}

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  hydrationDone: boolean;
  /** Notification IDs marked as seen (persisted for unauthenticated users) */
  seenNotificationIds: string[];
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (payload: { id_token: string } | { code: string; redirect_uri: string }) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateUser: (updates: Partial<Pick<User, 'name' | 'email'>>) => Promise<void>;
  setUserAfterPayment: (user: User) => Promise<void>;
  markNotificationSeen: (id: string) => Promise<void>;
  isNotificationSeen: (id: string) => boolean;
}

export const authStore = create<AuthStore>((set, get) => ({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  hydrationDone: false,
  seenNotificationIds: [],
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { user, access_token } = response.data;
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ isAuthenticated: true, user, accessToken: access_token });
    registerPushTokenIfNeeded().catch(() => {});
  },
  loginWithGoogle: async (payload: { id_token?: string; code?: string; redirect_uri?: string }) => {
    const body = payload.id_token
      ? { id_token: payload.id_token }
      : { code: payload.code, redirect_uri: payload.redirect_uri };
    const response = await api.post("/auth/google", body);
    const { user, access_token } = response.data;
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ isAuthenticated: true, user, accessToken: access_token });
    registerPushTokenIfNeeded().catch(() => {});
  },
  register: async (email: string, password: string, name: string) => {
    const response = await api.post("/auth/register", { email, password, name });
    const { user, access_token } = response.data;
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ isAuthenticated: true, user, accessToken: access_token });
    registerPushTokenIfNeeded().catch(() => {});
  },
  logout: async () => {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    set({ isAuthenticated: false, user: null, accessToken: null });
  },
  hydrate: async () => {
    const [token, userJson, seenJson] = await Promise.all([
      AsyncStorage.getItem(ACCESS_TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
      AsyncStorage.getItem(SEEN_NOTIFICATION_IDS_KEY),
    ]);
    let seenNotificationIds: string[] = [];
    try {
      if (seenJson) seenNotificationIds = JSON.parse(seenJson) as string[];
    } catch {
      // ignore invalid stored value
    }
    if (token && userJson) {
      try {
        const parsed = JSON.parse(userJson) as Partial<User> & { plan?: PlanId };
        const user: User = {
          ...parsed,
          plan: parsed.plan ?? 'free',
        } as User;
        set({ isAuthenticated: true, user, accessToken: token, seenNotificationIds, hydrationDone: true });
      } catch {
        set({ isAuthenticated: false, user: null, accessToken: null, seenNotificationIds, hydrationDone: true });
      }
    } else {
      set({ isAuthenticated: false, user: null, accessToken: null, seenNotificationIds, hydrationDone: true });
    }
  },
  markNotificationSeen: async (id: string) => {
    const { seenNotificationIds } = get();
    if (seenNotificationIds.includes(id)) return;
    const next = [...seenNotificationIds, id];
    set({ seenNotificationIds: next });
    await AsyncStorage.setItem(SEEN_NOTIFICATION_IDS_KEY, JSON.stringify(next));
  },
  isNotificationSeen: (id: string) => get().seenNotificationIds.includes(id),
  updateUser: async (updates) => {
    const { user } = get();
    if (!user) return;
    const payload: { name?: string; email?: string } = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email;
    const response = await api.patch<{ user: User }>("/auth/profile", payload);
    const updated = response.data?.user ?? { ...user, ...updates };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
    set({ user: updated });
  },
  setUserAfterPayment: async (user) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user });
  },
}));
