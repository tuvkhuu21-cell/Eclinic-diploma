"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { FormAlert } from "./FormAlert";
import { ProfileFormState, toInputDate, unwrap } from "./formUtils";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const maritalStatuses = ["Гэрлэсэн", "Гэрлээгүй", "Цуцалсан"];

export function PatientProfileForm() {
  const [form, setForm] = useState<ProfileFormState>({});
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadProfile().catch(() => setAlert({ type: "error", text: "Мэдээлэл татахад алдаа гарлаа" }));
  }, []);

  async function loadProfile() {
    const res = await api.get("/patient/profile");
    const data = unwrap<Record<string, any>>(res);
    setForm({
      lastName: data.user?.lastName || "", firstName: data.user?.firstName || "", phone: data.user?.phone || "", email: data.user?.email || "",
      registerNo: data.registerNo || "", gender: data.gender || "", dateOfBirth: toInputDate(data.dateOfBirth), bloodType: data.bloodType || "", maritalStatus: data.maritalStatus || "", heightCm: data.heightCm?.toString() || "", weightKg: data.weightKg?.toString() || "", bmi: data.bmi?.toString() || "", city: data.city || "", district: data.district || "", khoroo: data.khoroo || "", addressDetail: data.addressDetail || "", emergencyRelation: data.emergencyRelation || "", emergencyName: data.emergencyName || "", emergencyPhone: data.emergencyPhone || "",
    });
  }

  const calculatedBmi = useMemo(() => {
    const height = Number(form.heightCm);
    const weight = Number(form.weightKg);
    if (!height || !weight) return "";
    return (weight / (height / 100) ** 2).toFixed(1);
  }, [form.heightCm, form.weightKg]);

  async function save() {
    setSaving(true); setAlert(null);
    try {
      const res = await api.put("/patient/profile", { ...form, bmi: calculatedBmi || form.bmi });
      const data = unwrap<Record<string, any>>(res);
      setForm({
        lastName: data.user?.lastName || "", firstName: data.user?.firstName || "", phone: data.user?.phone || "", email: data.user?.email || "",
        registerNo: data.registerNo || "", gender: data.gender || "", dateOfBirth: toInputDate(data.dateOfBirth), bloodType: data.bloodType || "", maritalStatus: data.maritalStatus || "", heightCm: data.heightCm?.toString() || "", weightKg: data.weightKg?.toString() || "", bmi: data.bmi?.toString() || "", city: data.city || "", district: data.district || "", khoroo: data.khoroo || "", addressDetail: data.addressDetail || "", emergencyRelation: data.emergencyRelation || "", emergencyName: data.emergencyName || "", emergencyPhone: data.emergencyPhone || "",
      });
      setAlert({ type: "success", text: "Амжилттай хадгаллаа" });
    } catch {
      setAlert({ type: "error", text: "Хадгалах үед алдаа гарлаа" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Card className="p-6">
      <SectionTitle>Хувийн мэдээлэл</SectionTitle>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Овог" value={form.lastName} onChange={(value) => update("lastName", value)} />
        <Field label="Нэр" value={form.firstName} onChange={(value) => update("firstName", value)} />
        <Field label="Регистрийн дугаар" value={form.registerNo} onChange={(value) => update("registerNo", value)} />
        <Field label="Хүйс" value={form.gender} onChange={(value) => update("gender", value)} />
        <Field label="Төрсөн огноо" type="date" value={form.dateOfBirth} onChange={(value) => update("dateOfBirth", value)} />
        <SelectField label="Цусны бүлэг" value={form.bloodType} onChange={(value) => update("bloodType", value)} options={bloodTypes} />
        <SelectField label="Гэрлэлтийн байдал" value={form.maritalStatus} onChange={(value) => update("maritalStatus", value)} options={maritalStatuses} />
        <Field label="Утасны дугаар" value={form.phone} onChange={(value) => update("phone", value)} />
        <Field label="И-мэйл хаяг" type="email" value={form.email} onChange={(value) => update("email", value)} readOnly />
      </div>

      <SectionTitle className="mt-8">Биеийн жингийн индекс (БЖИ)</SectionTitle>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Биеийн өндөр" type="number" value={form.heightCm} onChange={(value) => update("heightCm", value)} suffix="см" />
        <Field label="Биеийн жин" type="number" value={form.weightKg} onChange={(value) => update("weightKg", value)} suffix="кг" />
      </div>
      <p className="mt-3 rounded-lg bg-cyanSoft px-4 py-3 text-sm font-semibold text-medical">
        БЖИ: {calculatedBmi || form.bmi || "Өндөр, жингээ оруулсны дараа тооцоологдоно"}
      </p>

      <SectionTitle className="mt-8">Гэрийн хаяг</SectionTitle>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Аймаг / Хот" value={form.city} onChange={(value) => update("city", value)} />
        <Field label="Сум / Дүүрэг" value={form.district} onChange={(value) => update("district", value)} />
        <Field label="Баг / Хороо" value={form.khoroo} onChange={(value) => update("khoroo", value)} />
        <Field label="Дэлгэрэнгүй хаяг" value={form.addressDetail} onChange={(value) => update("addressDetail", value)} className="md:col-span-2" />
      </div>

      <SectionTitle className="mt-8">Яаралтай үед холбогдох хүн</SectionTitle>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Field label="Таны хэн болох" value={form.emergencyRelation} onChange={(value) => update("emergencyRelation", value)} />
        <Field label="Яаралтай хүний нэр" value={form.emergencyName} onChange={(value) => update("emergencyName", value)} />
        <Field label="Яаралтай хүний утас" value={form.emergencyPhone} onChange={(value) => update("emergencyPhone", value)} />
      </div>
      </Card>
      <div className="mt-4 flex flex-col items-start gap-3">
        {alert && <FormAlert {...alert} />}
        <Button className="h-9 bg-navy px-5 hover:bg-slate-800" onClick={save} disabled={saving}>{saving ? "Хадгалж байна..." : "Хадгалах"}</Button>
      </div>
    </div>
  );

  function update(key: keyof ProfileFormState, value: string) {
    setForm((old) => ({ ...old, [key]: value }));
  }
}

function SectionTitle({ className, children }: { className?: string; children: ReactNode }) {
  return <h2 className={cn("text-xl font-bold text-medical", className)}>{children}</h2>;
}

function Field({ label, value, onChange, type = "text", className, readOnly, suffix }: { label: string; value?: string; onChange: (value: string) => void; type?: string; className?: string; readOnly?: boolean; suffix?: string }) {
  return (
    <label className={cn("text-sm font-semibold text-slate-600", className)}>
      {label}
      <div className="relative mt-2">
        <Input
          className={cn(readOnly && "bg-cyanSoft text-slate-600")}
          type={type}
          value={value || ""}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">{suffix}</span>}
      </div>
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value?: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="text-sm font-semibold text-slate-600">
      {label}
      <select
        className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-medical focus:ring-4 focus:ring-sky-100"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Сонгох</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}
