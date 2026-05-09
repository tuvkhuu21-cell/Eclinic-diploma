import { create } from "zustand";
export type ChatMessage = { id: string; text: string; senderId: string };
export const useChatStore = create<{ messages: ChatMessage[]; add: (m: ChatMessage) => void }>((set) => ({ messages: [], add: (m) => set((s) => ({ messages: [...s.messages, m] })) }));

