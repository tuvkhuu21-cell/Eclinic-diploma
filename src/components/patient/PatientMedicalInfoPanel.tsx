"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { api } from "@/services/api";

type PatientMedicalInfo = {
  registerNo?: string | null; gender?: string | null; dateOfBirth?: string | null; bloodType?: string | null; heightCm?: number | null; weightKg?: number | null; bmi?: number | null;
  hasAllergy?: boolean | null; allergyNote?: string | null; hasChronicDisease?: boolean | null; chronicDiseaseNote?: string | null; hasRegularMedicine?: boolean | null; regularMedicineNote?: string | null; hasInjury?: boolean | null; injuryNote?: string | null; hasSurgery?: boolean | null; surgeryNote?: string | null; smoking?: string | null; alcohol?: string | null; movement?: string | null; food?: string | null;
  user?: { firstName?: string | null; lastName?: string | null; email?: string | null; phone?: string | null };
};

export function PatientMedicalInfoPanel({ patientEmail = "patient@mediconnect.mn" }: { patientEmail?: string }) {
  const [data, setData] = useState<PatientMedicalInfo | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/patient/health?email=${encodeURIComponent(patientEmail)}`).then((res) => setData(res.data.data)).catch(() => setError(true));
  }, [patientEmail]);

  if (error) return <PanelShell><p className="text-sm text-slate-500">Өвчтөний мэдээлэл харах эрхтэй эмчээр нэвтэрнэ үү.</p></PanelShell>;
  if (!data) return <PanelShell><p className="text-sm text-slate-500">Мэдээлэл ачаалж байна...</p></PanelShell>;

  return (
    <PanelShell>
      <div className="rounded-lg bg-cyanSoft p-3">
        <p className="font-bold text-navy">{data.user?.lastName} {data.user?.firstName}</p>
        <p className="text-sm text-slate-600">{data.user?.email} · {data.user?.phone || "Утас бүртгээгүй"}</p>
      </div>
      <Info label="Регистр" value={data.registerNo} />
      <Info label="Хүйс / Цус" value={[data.gender, data.bloodType].filter(Boolean).join(" · ")} />
      <Info label="Өндөр / Жин / БЖИ" value={[data.heightCm && `${data.heightCm} см`, data.weightKg && `${data.weightKg} кг`, data.bmi && `БЖИ ${data.bmi}`].filter(Boolean).join(" · ")} />
      <Info label="Харшил" value={yesNo(data.hasAllergy, data.allergyNote)} />
      <Info label="Архаг өвчин" value={yesNo(data.hasChronicDisease, data.chronicDiseaseNote)} />
      <Info label="Тогтмол эм" value={yesNo(data.hasRegularMedicine, data.regularMedicineNote)} />
      <Info label="Гэмтэл" value={yesNo(data.hasInjury, data.injuryNote)} />
      <Info label="Мэс засал" value={yesNo(data.hasSurgery, data.surgeryNote)} />
      <Info label="Тамхи" value={data.smoking} />
      <Info label="Согтууруулах ундаа" value={data.alcohol} />
      <Info label="Хөдөлгөөн" value={data.movement} />
      <Info label="Хооллолт" value={data.food} />
    </PanelShell>
  );
}

function PanelShell({ children }: { children: React.ReactNode }) {
  return <aside className="rounded-lg bg-white p-5 shadow-soft"><h2 className="flex items-center gap-2 text-xl font-bold text-navy"><ShieldCheck className="text-medical" />Өвчтөний мэдээлэл</h2><div className="mt-4 grid gap-3">{children}</div><p className="mt-4 text-xs text-slate-400">Зөвхөн харах горим. Эмч засварлах боломжгүй.</p></aside>;
}

function Info({ label, value }: { label: string; value?: string | null | false }) {
  return <div className="rounded-lg border border-slate-100 p-3"><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-700">{value || "Бүртгээгүй"}</p></div>;
}

function yesNo(flag?: boolean | null, note?: string | null) {
  if (flag === undefined || flag === null) return "Бүртгээгүй";
  return `${flag ? "Байгаа" : "Байхгүй"}${note ? ` · ${note}` : ""}`;
}

