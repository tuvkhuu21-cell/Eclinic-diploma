"use client";

import { UserRound } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export type PatientSection = "personal" | "health" | "lifestyle" | "labs";

const groups: Array<{ title: string; items: Array<{ key: PatientSection | string; label: string }> }> = [
  { title: "Хэрэглэгчийн мэдээлэл", items: [{ key: "personal", label: "Хувийн мэдээлэл" }, { key: "health", label: "Эрүүл мэндийн мэдээлэл" }, { key: "lifestyle", label: "Амьдралын хэв маяг" }] },
  { title: "Эрүүл мэндийн түүх", items: ["Миний эмч", "Шинжилгээ", "Эмийн жор", "Эмийн захиалгууд", "Эмчийн тэмдэглэл", "Вакцин", "Цаг захиалга"].map((label) => ({ key: label, label })) },
  { title: "Бусад", items: ["И-Баримт", "Миний хэтэвч", "Захиалгын түүх", "Миний асуултууд", "Эм уух сануулга"].map((label) => ({ key: label, label })) },
];

export function PatientSidebar({ active, onSelect }: { active: PatientSection; onSelect: (section: PatientSection) => void }) {
  const user = useAuthStore((state) => state.user);
  const initials = `${user?.lastName?.[0] || ""}${user?.firstName?.[0] || "Х"}`;
  return (
    <aside className="rounded-lg bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-medical font-bold text-white">{initials}</div>
        <div>
          <p className="font-bold text-navy">{user?.lastName} {user?.firstName}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-5">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-xs font-bold uppercase text-slate-400">{group.title}</p>
            <div className="grid gap-1">
              {group.items.map((item) => {
                const selectable = item.key === "personal" || item.key === "health" || item.key === "lifestyle" || item.label === "Шинжилгээ";
                const key = item.label === "Шинжилгээ" ? "labs" : item.key;
                return (
                  <button key={`${group.title}-${item.label}`} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold ${active === key ? "bg-cyanSoft text-medical" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => selectable && onSelect(key as PatientSection)}>
                    <UserRound size={15} />{item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

