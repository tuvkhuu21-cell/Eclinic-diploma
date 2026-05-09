import { api } from "./api";
export const chatService = { rooms: () => api.get("/chat/rooms"), messages: (roomId: string) => api.get(`/chat/rooms/${roomId}/messages`) };

