import api from "@/lib/axios";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ACCESS_TOKEN_KEY = "access_token";
export const USER_KEY = "user";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  hydrationDone: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

export const authStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  hydrationDone: false,
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { user, access_token } = response.data;
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ isAuthenticated: true, user, accessToken: access_token });
  },
  register: async (email: string, password: string, name: string) => {
    const response = await api.post("/auth/register", { email, password, name });
    const { user, access_token } = response.data;
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ isAuthenticated: true, user, accessToken: access_token });
  },
  logout: async () => {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    set({ isAuthenticated: false, user: null, accessToken: null });
  },
  hydrate: async () => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    const userJson = await AsyncStorage.getItem(USER_KEY);
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        set({ isAuthenticated: true, user, accessToken: token, hydrationDone: true });
      } catch {
        set({ isAuthenticated: false, user: null, accessToken: null, hydrationDone: true });
      }
    } else {
      set({ isAuthenticated: false, user: null, accessToken: null, hydrationDone: true });
    }
  },
}));
