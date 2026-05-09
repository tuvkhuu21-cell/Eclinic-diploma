"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormAlert } from "./FormAlert";
import { HealthFormState, unwrap } from "./formUtils";

const items = [
  { flag: "hasAllergy", note: "allergyNote", title: "Харшил", yes: "Харшилтай", no: "Харшилгүй" },
  { flag: "hasChronicDisease", note: "chronicDiseaseNote", title: "Архаг хууч өвчин", yes: "Байгаа", no: "Байхгүй" },
  { flag: "hasRegularMedicine", note: "regularMedicineNote", title: "Тогтмол уудаг эм", yes: "Байгаа", no: "Байхгүй" },
  { flag: "hasInjury", note: "injuryNote", title: "Гэмтэл", yes: "Байгаа", no: "Байхгүй" },
  { flag: "hasSurgery", note: "surgeryNote", title: "Мэс засал", yes: "Байгаа", no: "Байхгүй" },
] as const;

export function PatientHealthForm() {
  const [form, setForm] = useState<HealthFormState>({});
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);
  useEffect(() => { api.get("/patient/health").then((res) => setForm(unwrap<HealthFormState>(res))).catch(() => setAlert({ type: "error", text: "Мэдээлэл татахад алдаа гарлаа" })); }, []);
  async function save() { setSaving(true); setAlert(null); try { await api.put("/patient/health", form); setAlert({ type: "success", text: "Амжилттай хадгаллаа" }); } catch { setAlert({ type: "error", text: "Хадгалах үед алдаа гарлаа" }); } finally { setSaving(false); } }
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-navy">Эрүүл мэндийн мэдээлэл</h2>
      <div className="mt-5 grid gap-3">
        {items.map((item) => <details key={item.title} className="rounded-lg border border-sky-100 p-4" open><summary className="cursor-pointer font-bold text-navy">{item.title}</summary><div className="mt-3 flex flex-wrap gap-3"><button className={`rounded-full px-4 py-2 text-sm font-semibold ${form[item.flag] ? "bg-medical text-white" : "bg-slate-100"}`} onClick={() => setForm((old) => ({ ...old, [item.flag]: true }))}>{item.yes}</button><button className={`rounded-full px-4 py-2 text-sm font-semibold ${form[item.flag] === false ? "bg-medical text-white" : "bg-slate-100"}`} onClick={() => setForm((old) => ({ ...old, [item.flag]: false }))}>{item.no}</button><input className="min-w-64 flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none" placeholder="Тайлбар" value={(form[item.note] as string) || ""} onChange={(e) => setForm((old) => ({ ...old, [item.note]: e.target.value }))} /></div></details>)}
      </div>
      <div className="mt-5 grid gap-3">{alert && <FormAlert {...alert} />}<Button onClick={save} disabled={saving}>{saving ? "Хадгалж байна..." : "Хадгалах"}</Button></div>
    </Card>
  );
}

