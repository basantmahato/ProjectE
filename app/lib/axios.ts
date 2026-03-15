import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";
import { getDeviceId } from "@/lib/deviceId";

const api = axios.create({
  baseURL: "http://192.168.29.34:3000/",
});

const ACCESS_TOKEN_KEY = "access_token";

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    const deviceId = await getDeviceId();
    config.headers["X-Device-ID"] = deviceId;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    if (err.response?.status === 401) {
      const { authStore } = await import("@/store/authStore");
      await authStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

export default api;