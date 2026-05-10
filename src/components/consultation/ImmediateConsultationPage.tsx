"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Star } from "lucide-react";
import { ImmediateConsultationSelector } from "./ImmediateConsultationSelector";
import { DoctorProfileModal } from "@/components/doctors/DoctorProfileModal";
import type { Doctor } from "@/components/doctors/DoctorCard";
import { api } from "@/services/api";

export function ImmediateConsultationPage() {
  const router = useRouter();
  const [selected, setSelected] = useState("Бүгд");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    const specialty = new URLSearchParams(window.location.search).get("specialty");
    if (specialty) setSelected(specialty);
  }, []);

  useEffect(() => {
    api.get("/doctors").then((response) => setDoctors(response.data.data as Doctor[])).catch(() => setDoctors([]));
  }, []);

  const visibleDoctors = useMemo(() => {
    if (!selected || selected === "Бүгд") return doctors;
    return doctors.filter((doctor) => specialtyMatches(doctor.specialty, selected));
  }, [selected]);

  return (
    <section className="bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <button type="button" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-medical hover:text-sky-600" onClick={() => router.back()}>
          <ChevronLeft size={18} />
          Буцах
        </button>
        <h1 className="text-3xl font-bold text-navy">Яг одоо цаг авах</h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_440px]">
          <div>
            <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-soft">
              <p className="text-sm font-semibold leading-6 text-slate-600">Яг одоо цаг авах үед нь тухайн цагаас өмнө эсвэл хойш 30 минутын хооронд байх боломжтойг анхаарна уу.</p>
            </div>
            <div className="mt-5 rounded-2xl border border-sky-100 bg-white p-5 shadow-soft">
              <h2 className="text-lg font-bold text-navy">Боломжтой эмч нар</h2>
              <div className="mt-4 grid gap-3">
                {visibleDoctors.map((doctor) => {
                  const doctorName = `${doctor.user.lastName || ""} ${doctor.user.firstName}`.trim();
                  const count = (doctor._count?.appointments || 0) + (doctor._count?.consultations || 0);
                  return (
                  <button key={doctor.id} type="button" className="w-full rounded-xl border border-sky-100 p-4 text-left transition hover:bg-cyanSoft" onClick={() => setSelectedDoctor(doctor)}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-cyanSoft font-bold text-medical">{doctor.user.lastName?.[0] || ""}{doctor.user.firstName[0]}</div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-navy">{doctorName}</h3>
                        <p className="mt-1 text-sm font-semibold text-medical">{doctor.specialty}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                          <span>{doctor.experience} жил туршлага</span>
                          <span className="font-bold text-medical">{doctor.fee.toLocaleString()}₮</span>
                          <span className="inline-flex items-center gap-1 text-amber-600"><Star size={15} fill="currentColor" />{doctor.rating} · {count} зөвлөгөө</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );})}
                {visibleDoctors.length === 0 && (
                  <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-sky-100 bg-cyanSoft text-center">
                    <p className="font-bold text-navy">{doctors.length === 0 ? "Одоогоор эмч бүртгэлгүй байна." : "Илэрц олдсонгүй"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <aside className="rounded-2xl border border-sky-100 bg-white p-5 shadow-soft">
            <ImmediateConsultationSelector selected={selected} onSelect={setSelected} />
          </aside>
        </div>
      </div>
      <DoctorProfileModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} />
    </section>
  );
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[,\s]/g, "");
}

function specialtyMatches(doctorSpecialty: string, selectedSpecialty: string) {
  const doctorValue = normalize(doctorSpecialty);
  const selectedValue = normalize(selectedSpecialty);
  const aliases: Record<string, string[]> = {
    [normalize("Дотор")]: [normalize("Дотор"), normalize("Дотрын")],
    [normalize("Арьс, харшил")]: [normalize("Арьс"), normalize("Харшил")],
    [normalize("Зүрх судас")]: [normalize("Зүрх судас")],
    [normalize("Мэдрэл")]: [normalize("Мэдрэл"), normalize("Мэдрэлийн")],
    [normalize("Хүүхэд")]: [normalize("Хүүхэд"), normalize("Хүүхдийн")],
    [normalize("Нүд")]: [normalize("Нүд")],
  };
  const needles = aliases[selectedValue] || [selectedValue];
  return needles.some((needle) => doctorValue.includes(needle));
}
