"use client";

import { useEffect, useState } from "react";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { DoctorFilter } from "@/components/doctors/DoctorFilter";
import type { Doctor } from "@/components/doctors/DoctorCard";
import { api } from "@/services/api";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    api.get("/doctors").then((response) => setDoctors(response.data.data as Doctor[])).catch(() => setDoctors([]));
  }, []);

  return <section className="mx-auto max-w-7xl px-4 py-10"><h1 className="text-3xl font-bold text-navy">Эмч нар</h1><p className="mt-2 text-slate-600">Мэргэжил, эмнэлэг, онлайн төлөвөөр хайж цаг захиална.</p><div className="mt-6"><DoctorFilter /></div><div className="mt-6 grid gap-5 md:grid-cols-2">{doctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}{doctors.length === 0 && <div className="rounded-lg border border-dashed border-sky-100 bg-cyanSoft p-6 text-center font-bold text-navy md:col-span-2">Одоогоор эмч бүртгэлгүй байна.</div>}</div></section>;
}
