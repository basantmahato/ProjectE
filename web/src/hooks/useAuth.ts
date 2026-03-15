"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { removeToken } from "@/lib/auth";

export function useAuth() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait for persisted auth store to rehydrate from localStorage before showing auth UI.
  // This prevents the navbar from briefly showing "Login / Get Started" when the user is logged in.
  useEffect(() => {
    if (!mounted) return;
    const persist = (useAuthStore as unknown as { persist?: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void } }).persist;
    if (!persist) {
      setHasHydrated(true);
      return;
    }
    if (persist.hasHydrated()) {
      setHasHydrated(true);
      return;
    }
    const unsub = persist.onFinishHydration(() => setHasHydrated(true));
    return unsub;
  }, [mounted]);

  const logout = () => {
    removeToken();
    router.push("/");
    router.refresh();
  };

  const isAuthReady = mounted && hasHydrated;
  const isLoggedIn = isAuthReady && !!token;

  return { isLoggedIn, isAuthReady, logout };
}
