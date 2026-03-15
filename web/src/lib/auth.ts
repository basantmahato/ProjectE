import { useAuthStore } from "@/store/authStore";

const TOKEN_KEY = "edusaas_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  useAuthStore.getState().setToken(token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  useAuthStore.getState().removeToken();
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
