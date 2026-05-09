"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { FormAlert } from "./FormAlert";
import { ProfileFormState, toInputDate, unwrap } from "./formUtils";

const fields: Array<{ key: keyof ProfileFormState; label: string; type?: string }> = [
  { key: "lastName", label: "Овог" }, { key: "firstName", label: "Нэр" }, { key: "registerNo", label: "Регистрийн дугаар" }, { key: "gender", label: "Хүйс" }, { key: "dateOfBirth", label: "Төрсөн огноо", type: "date" }, { key: "bloodType", label: "Цусны бүлэг" }, { key: "maritalStatus", label: "Гэрлэлтийн байдал" }, { key: "phone", label: "Утасны дугаар" }, { key: "email", label: "И-мэйл хаяг", type: "email" }, { key: "heightCm", label: "Биеийн өндөр", type: "number" }, { key: "weightKg", label: "Биеийн жин", type: "number" }, { key: "bmi", label: "БЖИ", type: "number" }, { key: "city", label: "Аймаг / Хот" }, { key: "district", label: "Сум / Дүүрэг" }, { key: "khoroo", label: "Баг / Хороо" }, { key: "addressDetail", label: "Дэлгэрэнгүй хаяг" }, { key: "emergencyRelation", label: "Таны хэн болох" }, { key: "emergencyName", label: "Яаралтай хүний нэр" }, { key: "emergencyPhone", label: "Яаралтай хүний утас" },
];

export function PatientProfileForm() {
  const [form, setForm] = useState<ProfileFormState>({});
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    api.get("/patient/profile").then((res) => {
      const data = unwrap<Record<string, any>>(res);
      setForm({
        lastName: data.user?.lastName || "", firstName: data.user?.firstName || "", phone: data.user?.phone || "", email: data.user?.email || "",
        registerNo: data.registerNo || "", gender: data.gender || "", dateOfBirth: toInputDate(data.dateOfBirth), bloodType: data.bloodType || "", maritalStatus: data.maritalStatus || "", heightCm: data.heightCm?.toString() || "", weightKg: data.weightKg?.toString() || "", bmi: data.bmi?.toString() || "", city: data.city || "", district: data.district || "", khoroo: data.khoroo || "", addressDetail: data.addressDetail || "", emergencyRelation: data.emergencyRelation || "", emergencyName: data.emergencyName || "", emergencyPhone: data.emergencyPhone || "",
      });
    }).catch(() => setAlert({ type: "error", text: "Мэдээлэл татахад алдаа гарлаа" }));
  }, []);

  async function save() {
    setSaving(true); setAlert(null);
    try {
      await api.put("/patient/profile", form);
      setAlert({ type: "success", text: "Амжилттай хадгаллаа" });
    } catch {
      setAlert({ type: "error", text: "Хадгалах үед алдаа гарлаа" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-navy">Хувийн мэдээлэл</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {fields.map((field) => <label key={field.key} className="text-sm font-semibold text-slate-600">{field.label}<Input className="mt-2" type={field.type || "text"} value={form[field.key] || ""} onChange={(e) => setForm((old) => ({ ...old, [field.key]: e.target.value }))} /></label>)}
      </div>
      <div className="mt-5 grid gap-3">{alert && <FormAlert {...alert} />}<Button onClick={save} disabled={saving}>{saving ? "Хадгалж байна..." : "Хадгалах"}</Button></div>
    </Card>
  );
}

