import { api } from "./api";
export const appointmentService = { list: () => api.get("/appointments"), create: (data: unknown) => api.post("/appointments", data) };

