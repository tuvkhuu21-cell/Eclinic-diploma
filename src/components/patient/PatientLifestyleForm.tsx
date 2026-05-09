"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);
  useEffect(() => { api.get("/patient/health").then((res) => setForm(unwrap<HealthFormState>(res))).catch(() => setAlert({ type: "error", text: "Мэдээлэл татахад алдаа гарлаа" })); }, []);
  async function save() { setSaving(true); setAlert(null); try { await api.put("/patient/health", form); setAlert({ type: "success", text: "Амжилттай хадгаллаа" }); } catch { setAlert({ type: "error", text: "Хадгалах үед алдаа гарлаа" }); } finally { setSaving(false); } }
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-navy">Амьдралын хэв маяг</h2>
      <div className="mt-5 grid gap-3">
        {sections.map((section) => <details key={section.key} className="rounded-lg border border-sky-100 p-4" open><summary className="cursor-pointer font-bold text-navy">{section.title}</summary><div className="mt-3 flex flex-wrap gap-2">{section.options.map((option) => <button key={option} className={`rounded-full px-4 py-2 text-sm font-semibold ${form[section.key] === option ? "bg-medical text-white" : "bg-slate-100 text-slate-600"}`} onClick={() => setForm((old) => ({ ...old, [section.key]: option }))}>{option}</button>)}</div></details>)}
      </div>
      <div className="mt-5 grid gap-3">{alert && <FormAlert {...alert} />}<Button onClick={save} disabled={saving}>{saving ? "Хадгалж байна..." : "Хадгалах"}</Button></div>
    </Card>
  );
}

