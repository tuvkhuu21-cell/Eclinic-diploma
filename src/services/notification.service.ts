import { api } from "./api";
export const notificationService = { list: () => api.get("/notifications"), markRead: (id: string) => api.patch(`/notifications/${id}/read`) };

