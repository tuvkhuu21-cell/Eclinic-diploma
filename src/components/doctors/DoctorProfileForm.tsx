"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { appointmentSpecialties } from "@/components/appointments/specialtyOptions";
import { api } from "@/services/api";

type DoctorProfileResponse = {
  specialty: string;
  bio?: string;
  experience: number;
  fee: number;
  gender?: string | null;
  online: boolean;
  supportsOnline?: boolean;
  supportsInPerson?: boolean;
  hospital?: { name: string } | null;
  user: {
    firstName: string;
    lastName?: string;
    phone?: string;
  };
};

type AlertState = { type: "success" | "error"; text: string };

export function DoctorProfileForm() {
  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    phone: "",
    specialty: appointmentSpecialties[0] || "Дотор",
    experience: "",
    fee: "",
    gender: "Эмэгтэй",
    hospital: "",
    bio: "",
    online: false,
    supportsOnline: true,
    supportsInPerson: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  useEffect(() => {
    api.get("/doctors/me")
      .then((response) => {
        const profile = response.data.data as DoctorProfileResponse | null;
        if (!profile) return;
        setForm({
          lastName: profile.user.lastName || "",
          firstName: profile.user.firstName || "",
          phone: profile.user.phone || "",
          specialty: profile.specialty,
          experience: String(profile.experience),
          fee: String(profile.fee),
          gender: profile.gender || "Эмэгтэй",
          hospital: profile.hospital?.name || "",
          bio: profile.bio || "",
          online: profile.online,
          supportsOnline: profile.supportsOnline ?? profile.online,
          supportsInPerson: profile.supportsInPerson ?? false,
        });
      })
      .catch(() => setAlert({ type: "error", text: "Профайл ачаалж чадсангүй" }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAlert(null);
    try {
      setSaving(true);
      await api.patch("/doctors/me", {
        ...form,
        experience: Number(form.experience),
        fee: Number(form.fee),
      });
      setAlert({ type: "success", text: "Профайл амжилттай хадгалагдлаа" });
    } catch {
      setAlert({ type: "error", text: "Профайл хадгалахад алдаа гарлаа" });
    } finally {
      setSaving(false);
    }
  }

  function patch(key: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  if (loading) return <Card className="p-5 text-sm font-semibold text-slate-500">Профайл ачаалж байна...</Card>;

  return (
    <Card className="p-5">
      <h2 className="text-xl font-bold text-navy">Эмчийн профайл</h2>
      <p className="mt-1 text-sm text-slate-500">Энд хадгалсан мэдээлэл өвчтөнд харагдана.</p>
      {alert && <div className={`mt-4 rounded-lg border px-4 py-3 text-sm font-semibold ${alert.type === "success" ? "border-emerald-100 bg-emerald-50 text-emerald-800" : "border-rose-100 bg-rose-50 text-rose-800"}`}>{alert.text}</div>}
      <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <Input placeholder="Овог" value={form.lastName} onChange={(event) => patch("lastName", event.target.value)} disabled={saving} />
        <Input placeholder="Нэр" value={form.firstName} onChange={(event) => patch("firstName", event.target.value)} disabled={saving} />
        <Input inputMode="tel" placeholder="Утас" value={form.phone} onChange={(event) => patch("phone", event.target.value)} disabled={saving} />
        <select className="h-11 rounded-lg border border-slate-200 px-4 text-sm outline-none transition focus:border-medical focus:ring-4 focus:ring-sky-100" value={form.gender} onChange={(event) => patch("gender", event.target.value)} disabled={saving}>
          <option>Эрэгтэй</option>
          <option>Эмэгтэй</option>
        </select>
        <select className="h-11 rounded-lg border border-slate-200 px-4 text-sm outline-none transition focus:border-medical focus:ring-4 focus:ring-sky-100" value={form.specialty} onChange={(event) => patch("specialty", event.target.value)} disabled={saving}>
          {appointmentSpecialties.map((specialty) => <option key={specialty}>{specialty}</option>)}
        </select>
        <Input inputMode="numeric" placeholder="Туршлага" value={form.experience} onChange={(event) => patch("experience", event.target.value)} disabled={saving} />
        <Input inputMode="numeric" placeholder="Үзлэгийн төлбөр" value={form.fee} onChange={(event) => patch("fee", event.target.value)} disabled={saving} />
        <Input placeholder="Эмнэлэг" value={form.hospital} onChange={(event) => patch("hospital", event.target.value)} disabled={saving} />
        <label className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">
          <input type="checkbox" className="h-4 w-4 accent-medical" checked={form.online} onChange={(event) => patch("online", event.target.checked)} disabled={saving} />
          Онлайн төлөв
        </label>
        <label className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">
          <input type="checkbox" className="h-4 w-4 accent-medical" checked={form.supportsOnline} onChange={(event) => patch("supportsOnline", event.target.checked)} disabled={saving} />
          Онлайн үзлэг авна
        </label>
        <label className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">
          <input type="checkbox" className="h-4 w-4 accent-medical" checked={form.supportsInPerson} onChange={(event) => patch("supportsInPerson", event.target.checked)} disabled={saving} />
          Биечлэн үзлэг авна
        </label>
        <textarea className="min-h-28 rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-medical focus:ring-4 focus:ring-sky-100 md:col-span-2" placeholder="Товч танилцуулга" value={form.bio} onChange={(event) => patch("bio", event.target.value)} disabled={saving} />
        <Button className="md:col-span-2" disabled={saving}>{saving ? "Хадгалж байна..." : "Хадгалах"}</Button>
      </form>
    </Card>
  );
}
