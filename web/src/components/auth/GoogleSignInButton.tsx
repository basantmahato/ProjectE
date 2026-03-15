"use client";

import { useEffect, useRef, useState } from "react";
import {
  getGoogleClientId,
  loadGoogleScript,
  initAndRenderGoogleButton,
} from "@/lib/googleAuth";

type GoogleSignInButtonProps = {
  onSuccess: (idToken: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  className?: string;
};

export function GoogleSignInButton({
  onSuccess,
  onError,
  disabled,
  theme = "outline",
  size = "large",
  className = "",
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  useEffect(() => {
    const clientId = getGoogleClientId();
    if (!clientId) {
      setLoadError("Google Sign-In not configured");
      return;
    }
    let mounted = true;
    loadGoogleScript()
      .then(() => {
        if (!mounted || !containerRef.current) return;
        initAndRenderGoogleButton(
          containerRef.current,
          clientId,
          (idToken) => onSuccessRef.current(idToken),
          { theme, size }
        );
        setReady(true);
      })
      .catch((err) => {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : "Failed to load Google Sign-In";
        setLoadError(message);
        onErrorRef.current?.(err instanceof Error ? err : new Error(message));
      });
    return () => {
      mounted = false;
    };
  }, [theme, size]);

  if (loadError) {
    return (
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        {loadError}
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        minHeight: size === "large" ? 44 : size === "medium" ? 36 : 28,
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? "none" : undefined,
      }}
      aria-hidden={!ready}
    />
  );
}
