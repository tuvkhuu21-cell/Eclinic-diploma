"use client";

import { useEffect, useState } from "react";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import type { Doctor } from "@/components/doctors/DoctorCard";
import { api } from "@/services/api";

export function PopularDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    api.get("/doctors").then((response) => setDoctors(response.data.data as Doctor[])).catch(() => setDoctors([]));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-end justify-between"><div><h2 className="text-3xl font-bold text-navy">Эрэлттэй эмч нар</h2><p className="mt-2 text-slate-600">Үнэлгээ өндөр, онлайн зөвлөгөө өгөх боломжтой эмчүүд.</p></div></div>
      <div className="grid gap-5 md:grid-cols-2">{doctors.slice(0, 4).map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}{doctors.length === 0 && <div className="rounded-lg border border-dashed border-sky-100 bg-cyanSoft p-6 text-center font-bold text-navy md:col-span-2">Одоогоор эмч бүртгэлгүй байна.</div>}</div>
    </section>
  );
}
