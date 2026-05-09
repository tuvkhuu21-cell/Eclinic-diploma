import { api } from "./api";
export const videoService = { request: (data: unknown) => api.post("/video-calls/request", data) };

