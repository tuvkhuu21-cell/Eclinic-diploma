"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
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
  const [openSection, setOpenSection] = useState("Харшил");
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);
  useEffect(() => { loadHealth().catch(() => setAlert({ type: "error", text: "Мэдээлэл татахад алдаа гарлаа" })); }, []);
  async function loadHealth() {
    const response = await api.get("/patient/health");
    setForm(unwrap<HealthFormState>(response));
  }
  async function save() { setSaving(true); setAlert(null); try { await api.put("/patient/health", form); await loadHealth(); setAlert({ type: "success", text: "Амжилттай хадгаллаа" }); } catch { setAlert({ type: "error", text: "Хадгалах үед алдаа гарлаа" }); } finally { setSaving(false); } }
  return (
    <div>
      <Card className="p-6">
      <h2 className="text-xl font-bold text-medical">Эрүүл мэндийн мэдээлэл</h2>
      <div className="mt-5 grid gap-3">
        {items.map((item) => {
          const isOpen = openSection === item.title;
          return (
            <section key={item.title} className="overflow-hidden rounded-lg border border-sky-100 bg-white">
              <button type="button" className="flex w-full items-center justify-between px-4 py-4 text-left font-bold text-medical" onClick={() => setOpenSection(isOpen ? "" : item.title)}>
                {item.title}
                <ChevronDown size={18} className={cn("transition", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="grid gap-3 border-t border-sky-100 p-4">
                  <RadioRow label={item.yes} checked={form[item.flag] === true} onChange={() => setForm((old) => ({ ...old, [item.flag]: true }))} />
                  <RadioRow label={item.no} checked={form[item.flag] === false} onChange={() => setForm((old) => ({ ...old, [item.flag]: false }))} />
                  <input className="h-11 rounded-lg border border-sky-100 bg-white px-4 text-sm outline-none focus:border-medical focus:ring-4 focus:ring-sky-100" placeholder="Тайлбар" value={(form[item.note] as string) || ""} onChange={(e) => setForm((old) => ({ ...old, [item.note]: e.target.value }))} />
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

function RadioRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-sky-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-medical hover:bg-cyanSoft">
      <input type="radio" className="h-4 w-4 accent-medical" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}
