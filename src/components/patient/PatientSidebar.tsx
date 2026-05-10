"use client";

import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export type PatientSection = "personal" | "health" | "lifestyle" | "labs" | "doctors" | "appointments" | "orders";

const groups: Array<{ title: string; items: Array<{ key: PatientSection | string; label: string }> }> = [
  { title: "Хэрэглэгчийн мэдээлэл", items: [{ key: "personal", label: "Хувийн мэдээлэл" }, { key: "health", label: "Эрүүл мэндийн мэдээлэл" }, { key: "lifestyle", label: "Амьдралын хэв маяг" }] },
  { title: "Эрүүл мэндийн түүх", items: ["Миний эмч", "Шинжилгээ", "Вакцин", "Цаг захиалга"].map((label) => ({ key: label, label })) },
  { title: "Бусад", items: ["И Баримт", "Миний хэтэвч", "Захиалгын түүх", "Миний асуултууд", "Эм уух сануулга"].map((label) => ({ key: label, label })) },
];

export function PatientSidebar({ active, onSelect }: { active: PatientSection; onSelect: (section: PatientSection) => void }) {
  const user = useAuthStore((state) => state.user);
  const [notice, setNotice] = useState("");
  const initials = `${user?.lastName?.[0] || ""}${user?.firstName?.[0] || "Х"}`;

  useEffect(() => {
    const section = new URLSearchParams(window.location.search).get("section");
    if (section === "profile") onSelect("personal");
    if (section === "labs") onSelect("labs");
    if (section === "doctors") onSelect("doctors");
    if (section === "appointments") onSelect("appointments");
    if (section === "orders") onSelect("orders");
  }, [onSelect]);

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
                const key = item.label === "Шинжилгээ" ? "labs" : item.label === "Миний эмч" ? "doctors" : item.label === "Цаг захиалга" ? "appointments" : item.label === "Захиалгын түүх" ? "orders" : item.key;
                const selectable = key === "personal" || key === "health" || key === "lifestyle" || key === "labs" || key === "doctors" || key === "appointments" || key === "orders";
                const comingSoon = group.title === "Бусад" && item.label !== "Захиалгын түүх";
                return (
                  <button key={`${group.title}-${item.label}`} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold ${active === key ? "bg-cyanSoft text-medical" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => comingSoon ? setNotice(`${item.label} тун удахгүй нэмэгдэнэ.`) : selectable && onSelect(key as PatientSection)}>
                    <UserRound size={15} />
                    <span className="flex-1">{item.label}</span>
                    {comingSoon && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">0</span>}
                    {comingSoon && <span className="rounded-full bg-cyanSoft px-2 py-0.5 text-[10px] font-bold text-medical">Тун удахгүй</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {notice && <div className="rounded-xl border border-sky-100 bg-cyanSoft px-3 py-2 text-xs font-semibold text-medical">{notice}</div>}
      </div>
    </aside>
  );
}
