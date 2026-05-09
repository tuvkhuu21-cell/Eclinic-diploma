import { api } from "./api";
export const aiService = { ask: (data: unknown) => api.post("/ai/ask", data), tools: () => api.get("/ai/tools") };

