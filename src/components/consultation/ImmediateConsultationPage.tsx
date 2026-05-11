"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, ChevronLeft, Star } from "lucide-react";
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
    const activeDoctors = doctors.filter((doctor) => (doctor.online || Boolean((doctor as Doctor & { isOnline?: boolean }).isOnline)) && (doctor.supportsOnline ?? true));
    if (!selected || selected === "Бүгд") return activeDoctors;
    return activeDoctors.filter((doctor) => specialtyMatches(doctor.specialty, selected));
  }, [doctors, selected]);

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
                  <article key={doctor.id} className="w-full rounded-xl border border-sky-100 p-4 text-left transition hover:bg-cyanSoft">
                    <div role="button" tabIndex={0} className="flex cursor-pointer flex-col gap-4 md:flex-row md:items-center" onClick={() => setSelectedDoctor(doctor)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedDoctor(doctor); }}>
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-cyanSoft font-bold text-medical">{doctor.user.lastName?.[0] || ""}{doctor.user.firstName[0]}</div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-navy">{doctorName}</h3>
                        <p className="mt-1 text-sm font-semibold text-medical">{doctor.specialty}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                          <span>{doctor.experience} жил туршлага</span>
                          <span className="font-bold text-medical">{(doctor.fee || 30000).toLocaleString()}₮</span>
                          <span className="inline-flex items-center gap-1 text-amber-600"><Star size={15} fill="currentColor" />{doctor.rating} · {count} зөвлөгөө</span>
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />Active</span>
                        </div>
                      </div>
                    </div>
                    <QuickInstantSlots doctorId={doctor.id} price={doctor.fee || 30000} />
                  </article>
                );})}
                {visibleDoctors.length === 0 && (
                  <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-sky-100 bg-cyanSoft text-center">
                    <p className="font-bold text-navy">{doctors.length === 0 ? "Одоогоор эмч бүртгэлгүй байна." : "Active эмч олдсонгүй"}</p>
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

function QuickInstantSlots({ doctorId, price }: { doctorId: string; price: number }) {
  const router = useRouter();
  const [slots, setSlots] = useState<Array<{ label: string; iso: string }>>([]);

  useEffect(() => {
    const now = new Date();
    const rounded = new Date(now);
    rounded.setMinutes(now.getMinutes() <= 30 ? 30 : 60, 0, 0);
    const next = [0, 30, 60].map((offset) => {
      const slot = new Date(rounded.getTime() + offset * 60000);
      return { label: `${String(slot.getHours()).padStart(2, "0")}:${String(slot.getMinutes()).padStart(2, "0")}`, iso: slot.toISOString() };
    });
    setSlots(next);
  }, []);

  function book(iso: string) {
    const params = new URLSearchParams({
      service: doctorId,
      time: iso,
      type: "ONLINE",
      price: String(price || 30000),
    });
    router.push(`/patient/home/appointment/confirmation?${params.toString()}`);
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2" onClick={(event) => event.stopPropagation()}>
      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500"><CalendarClock size={14} />Яг одоо:</span>
      {slots.map((slot) => (
        <button key={slot.iso} type="button" className="rounded-full border border-sky-100 bg-white px-3 py-1.5 text-xs font-bold text-medical transition hover:bg-medical hover:text-white" onClick={() => book(slot.iso)}>
          {slot.label}
        </button>
      ))}
    </div>
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
