"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { FormAlert } from "./FormAlert";
import { HealthFormState, unwrap } from "./formUtils";

const sections = [
  { key: "smoking", title: "Тамхи", options: ["Татдаггүй", "Татдаг байсан, Тамхинаас гарсан", "Өдөрт 1-2", "Өдөрт 3-5", "Өдөрт 5-10", "Өдөрт 10-аас их"] },
  { key: "alcohol", title: "Согтууруулах ундаа", options: ["Хэрэглэдэггүй", "7 хоногт 4-өөс их удаа", "7 хоногт 1-4 удаа", "Сард 3-аас бага удаа уудаг"] },
  { key: "movement", title: "Хөдөлгөөн", options: ["Хөдөлгөөн багатай", "Дунд зэргийн идэвхтэй", "Өндөр идэвхтэй", "Маш их идэвхтэй"] },
  { key: "food", title: "Хооллолт", options: ["Ердийн", "Цагаан хоолтон", "Ногоон хоолтон / Ургамал хоолтон", "Бусад"] },
] as const;

export function PatientLifestyleForm() {
  const [form, setForm] = useState<HealthFormState>({});
  const [openSection, setOpenSection] = useState("Тамхи");
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);
  useEffect(() => { loadLifestyle().catch(() => setAlert({ type: "error", text: "Мэдээлэл татахад алдаа гарлаа" })); }, []);
  async function loadLifestyle() {
    const response = await api.get("/patient/health");
    setForm(unwrap<HealthFormState>(response));
  }
  async function save() { setSaving(true); setAlert(null); try { const response = await api.put("/patient/health", form); setForm(unwrap<HealthFormState>(response)); setAlert({ type: "success", text: "Амжилттай хадгаллаа" }); } catch { setAlert({ type: "error", text: "Хадгалах үед алдаа гарлаа" }); } finally { setSaving(false); } }
  return (
    <div>
      <Card className="p-6">
      <h2 className="text-xl font-bold text-medical">Амьдралын хэв маяг</h2>
      <div className="mt-5 grid gap-3">
        {sections.map((section) => {
          const isOpen = openSection === section.title;
          return (
            <section key={section.key} className="overflow-hidden rounded-lg border border-sky-100 bg-white">
              <button type="button" className="flex w-full items-center justify-between px-4 py-4 text-left font-bold text-medical" onClick={() => setOpenSection(isOpen ? "" : section.title)}>
                {section.title}
                <ChevronDown size={18} className={cn("transition", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="grid gap-3 border-t border-sky-100 p-4">
                  {section.options.map((option) => (
                    <label key={option} className="flex cursor-pointer items-center gap-3 rounded-lg border border-sky-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-medical hover:bg-cyanSoft">
                      <input type="radio" className="h-4 w-4 accent-medical" checked={form[section.key] === option} onChange={() => setForm((old) => ({ ...old, [section.key]: option }))} />
                      {option}
                    </label>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
      </Card>
      <div className="mt-4 flex flex-col items-start gap-3">{alert && <FormAlert {...alert} />}<Button className="h-9 bg-navy px-5 hover:bg-slate-800" onClick={save} disabled={saving}>{saving ? "Хадгалж байна..." : "Хадгалах"}</Button></div>
    </div>
  );
}
