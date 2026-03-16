"use client";

import {
  getVapidPublicKey,
  registerWebPushSubscription,
} from "./api";

const PUSH_SW_PATH = "/push-sw.js";

/**
 * Convert base64 (or base64url) VAPID public key to Uint8Array for pushManager.subscribe.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

export type WebPushRegisterResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Register service worker, request notification permission, subscribe to push with VAPID,
 * and send the subscription to the API. Call from the notifications page or settings when user clicks "Enable notifications".
 */
export async function registerWebPush(): Promise<WebPushRegisterResult> {
  if (typeof window === "undefined") {
    return { ok: false, error: "Not in browser" };
  }
  if (!("Notification" in window)) {
    return { ok: false, error: "Notifications not supported" };
  }
  if (!("serviceWorker" in navigator)) {
    return { ok: false, error: "Service workers not supported" };
  }

  try {
    const { vapidPublicKey } = await getVapidPublicKey();
    if (!vapidPublicKey) {
      return { ok: false, error: "VAPID key not configured" };
    }

    const registration = await navigator.serviceWorker.register(PUSH_SW_PATH);
    await navigator.serviceWorker.ready;

    let permission = Notification.permission;
    if (permission !== "granted") {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") {
      return {
        ok: false,
        error:
          "Notifications were blocked. You can allow them in your browser settings and try again.",
      };
    }

    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as BufferSource,
    });

    const toBase64Url = (buf: ArrayBuffer): string => {
      const bytes = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    };

    const payload = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: toBase64Url(subscription.getKey("p256dh")!),
        auth: toBase64Url(subscription.getKey("auth")!),
      },
    };

    await registerWebPushSubscription(payload);
    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to enable notifications";
    return { ok: false, error: message };
  }
}

export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export function getNotificationPermission(): NotificationPermission | null {
  if (typeof window === "undefined" || !("Notification" in window))
    return null;
  return Notification.permission;
}
