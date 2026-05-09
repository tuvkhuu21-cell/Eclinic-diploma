import { api } from "./api";
export const hospitalService = { list: () => api.get("/hospitals"), detail: (id: string) => api.get(`/hospitals/${id}`) };

