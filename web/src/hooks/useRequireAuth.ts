"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

/**
 * Redirects to /login if the user is not authenticated.
 * Returns `isReady: true` once the auth check passes so
 * components can gate rendering until ready.
 */
export function useRequireAuth() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setIsReady(true);
  }, [router]);

  return { isReady };
}
