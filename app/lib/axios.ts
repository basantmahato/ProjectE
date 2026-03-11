import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({ 
    // baseURL: process.env.API_URL,
    // baseURL: "http://localhost:3000/",
    baseURL: "http://10.0.2.2:3000/",

});

// Use same key as authStore.ACCESS_TOKEN_KEY ("access_token")
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
export default api;