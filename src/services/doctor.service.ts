import { api } from "./api";
export const doctorService = { list: () => api.get("/doctors"), detail: (id: string) => api.get(`/doctors/${id}`) };

