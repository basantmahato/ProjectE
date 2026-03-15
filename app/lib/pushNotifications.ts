import Constants from "expo-constants";
import { Platform } from "react-native";
import api from "@/lib/axios";
import { getDeviceId } from "@/lib/deviceId";
import { notificationStore } from "@/store/notificationStore";

/**
 * Request notification permission and register the Expo push token with the backend.
 * Call after login or when the app opens and the user is authenticated.
 * Skips if notifications are disabled in settings or permission is denied.
 * In Expo Go (SDK 53+) push is not supported — we skip so the app still runs.
 */
export async function registerPushTokenIfNeeded(): Promise<void> {
  // Push was removed from Expo Go in SDK 53; only development/standalone builds support it.
  if (Constants.appOwnership === "expo") {
    return;
  }

  if (!notificationStore.getState().enabled) {
    return;
  }

  const Device = await import("expo-device");
  if (!Device.isDevice) {
    return;
  }

  const Notifications = await import("expo-notifications");

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    if (finalStatus !== "granted") {
      return;
    }
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "default",
    });
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId as
      | string
      | undefined;
    const tokenResult = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const expoPushToken = tokenResult.data;
    const deviceId = await getDeviceId();

    await api.post("/notifications/register-device", {
      expoPushToken,
      deviceId,
    });
  } catch (err) {
    console.warn("[pushNotifications] Failed to register push token:", err);
  }
}
