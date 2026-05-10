"use client";

import { create } from "zustand";

export type CartPackage = {
  id: string;
  name: string;
  price: string;
  description?: string;
};

type CartState = {
  items: CartPackage[];
  hasHydrated: boolean;
  hydrate: () => void;
  addItem: (item: CartPackage) => void;
  removeItem: (id: string) => void;
  hasItem: (id: string) => boolean;
};

const storageKey = "mediconnect_package_cart";

function persist(items: CartPackage[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey, JSON.stringify(items));
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  hasHydrated: false,
  hydrate: () => {
    if (typeof window === "undefined") {
      set({ hasHydrated: true });
      return;
    }
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      set({ hasHydrated: true });
      return;
    }
    try {
      set({ items: JSON.parse(raw) as CartPackage[], hasHydrated: true });
    } catch {
      localStorage.removeItem(storageKey);
      set({ hasHydrated: true });
    }
  },
  addItem: (item) => {
    const exists = get().items.some((current) => current.id === item.id);
    if (exists) return;
    const items = [...get().items, item];
    persist(items);
    set({ items });
  },
  removeItem: (id) => {
    const items = get().items.filter((item) => item.id !== id);
    persist(items);
    set({ items });
  },
  hasItem: (id) => get().items.some((item) => item.id === id),
}));
