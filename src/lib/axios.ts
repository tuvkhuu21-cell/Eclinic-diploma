import axios from "axios";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
const normalizedBaseUrl = apiBaseUrl ? (apiBaseUrl.endsWith("/api") ? apiBaseUrl : `${apiBaseUrl.replace(/\/$/, "")}/api`) : "/api";

export const apiClient = axios.create({
  baseURL: normalizedBaseUrl,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("mediconnect_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
