/**
 * Google Identity Services (GIS) for web.
 * Load the script, initialize with client_id, and render the Sign in with Google button.
 * Backend expects id_token (JWT) via POST /auth/google.
 */

const GSI_SCRIPT = "https://accounts.google.com/gsi/client";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              width?: number;
            }
          ) => void;
        };
      };
    };
  }
}

export function getGoogleClientId(): string {
  if (typeof process === "undefined") return "";
  const id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  return typeof id === "string" ? id : "";
}

export function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  const existing = document.querySelector(`script[src="${GSI_SCRIPT}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const t = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(t);
          resolve();
        } else if (Date.now() > deadline) {
          clearInterval(t);
          reject(new Error("Google Sign-In timed out"));
        }
      }, 50);
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SCRIPT;
    script.async = true;
    script.onload = () => {
      const deadline = Date.now() + 3000;
      const t = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(t);
          resolve();
        } else if (Date.now() > deadline) {
          clearInterval(t);
          reject(new Error("Google Sign-In timed out"));
        }
      }, 50);
    };
    script.onerror = () => reject(new Error("Failed to load Google Sign-In"));
    document.head.appendChild(script);
  });
}

export function initAndRenderGoogleButton(
  container: HTMLElement,
  clientId: string,
  onCredential: (idToken: string) => void,
  options?: { theme?: "outline" | "filled_blue" | "filled_black"; size?: "large" | "medium" | "small" }
): void {
  if (!clientId || !window.google?.accounts?.id) return;
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      if (response?.credential) onCredential(response.credential);
    },
  });
  window.google.accounts.id.renderButton(container, {
    type: "standard",
    theme: options?.theme ?? "outline",
    size: options?.size ?? "large",
    text: "continue_with",
    width: container.offsetWidth || 320,
  });
}
