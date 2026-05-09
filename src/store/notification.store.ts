import { create } from "zustand";
export type Notification = { id: string; title: string; body?: string };
export const useNotificationStore = create<{ items: Notification[]; add: (n: Notification) => void }>((set) => ({ items: [], add: (n) => set((s) => ({ items: [n, ...s.items] })) }));

