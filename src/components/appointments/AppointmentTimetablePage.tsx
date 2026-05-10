"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";
import { DoctorSummary, type DoctorDetail } from "./AppointmentBookingPage";

type DaySlots = {
  date: string;
  label: string;
  slots: Array<{ iso: string; label: string }>;
};

const weekdays = ["ням", "даваа", "мягмар", "лхагва", "пүрэв", "баасан", "бямба"];

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMongolianDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}. ${weekdays[date.getDay()]}`;
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function AppointmentTimetablePage() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [mounted, setMounted] = useState(false);
  const [doctorId, setDoctorId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [warning, setWarning] = useState("");

  useEffect(() => {
    setDoctorId(new URLSearchParams(window.location.search).get("service") || "");
    const today = toInputDate(new Date());
    setStartDate(today);
    setEndDate(today);
    setSelectedDay(today);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!doctorId) return;
    api.get(`/doctors/${doctorId}`).then((response) => setDoctor(response.data.data as DoctorDetail)).catch(() => setDoctor(null));
  }, [doctorId]);

  const daySlots = useMemo(() => (startDate && endDate ? generateAvailability(startDate, endDate) : []), [endDate, startDate]);

  useEffect(() => {
    if (!daySlots.some((day) => day.date === selectedDay)) {
      setSelectedDay(daySlots[0]?.date || startDate);
      setSelectedTime("");
    }
  }, [daySlots, selectedDay, startDate]);

  function continueToConfirmation() {
    if (!selectedTime) {
      setWarning("Цаг сонгоно уу.");
      return;
    }
    router.push(`/patient/home/appointment/confirmation?service=${encodeURIComponent(doctorId)}&time=${encodeURIComponent(selectedTime)}`);
  }

  if (!mounted) {
    return (
      <section className="bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-navy">Цаг захиалга</h1>
          <div className="mt-6 rounded-2xl border border-sky-100 bg-white p-6 text-sm font-semibold text-slate-500 shadow-soft">Цагийн хуваарь ачаалж байна...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <button type="button" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-medical hover:text-sky-600" onClick={() => router.back()}><ChevronLeft size={18} />Буцах</button>
        <h1 className="text-3xl font-bold text-navy">Цаг захиалга</h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-2xl border border-sky-100 bg-white p-6 shadow-soft">
            {doctor ? <DoctorSummary doctor={doctor} /> : <p className="text-sm text-slate-500">Эмчийн мэдээлэл ачаалж байна...</p>}
            <div className="mt-6 grid gap-4">
              <label className="text-sm font-bold text-navy">
                Эхлэх огноо
                <input type="date" className="mt-2 h-11 w-full rounded-lg border border-sky-100 px-3 text-sm outline-none focus:border-medical" value={startDate} onChange={(event) => { const next = event.target.value; setStartDate(next); if (endDate < next) setEndDate(next); setSelectedTime(""); }} />
              </label>
              <label className="text-sm font-bold text-navy">
                Дуусах огноо
                <input type="date" className="mt-2 h-11 w-full rounded-lg border border-sky-100 px-3 text-sm outline-none focus:border-medical" value={endDate} min={startDate} onChange={(event) => { setEndDate(event.target.value); setSelectedTime(""); }} />
              </label>
              <div className="rounded-xl bg-cyanSoft p-4 text-sm font-bold text-medical">
                {startDate} → {endDate}
              </div>
            </div>
          </aside>
          <main className="rounded-2xl border border-sky-100 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-navy">Боломжтой цагууд</h2>
            <div className="mt-5 grid gap-4">
              {daySlots.map((day) => (
                <div key={day.date} className={`rounded-xl border p-4 transition ${selectedDay === day.date ? "border-medical bg-sky-50" : "border-sky-100 bg-white"}`}>
                  <button type="button" className="flex w-full items-center gap-2 text-left font-bold text-navy" onClick={() => { setSelectedDay(day.date); setSelectedTime(""); }}>
                    <CalendarDays size={18} className="text-medical" />
                    {day.label}
                  </button>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {day.slots.map((slot) => (
                      <button key={slot.iso} type="button" className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${selectedTime === slot.iso ? "border-medical bg-medical text-white" : "border-sky-100 bg-white text-slate-700 hover:bg-cyanSoft hover:text-medical"}`} onClick={() => { setSelectedDay(day.date); setSelectedTime(slot.iso); setWarning(""); }}>
                        <Clock size={15} className="mx-auto mb-1" />
                        {slot.label}
                      </button>
                    ))}
                    {day.slots.length === 0 && <p className="rounded-lg bg-cyanSoft p-3 text-sm font-semibold text-medical sm:col-span-3 md:col-span-4">Энэ өдөр боломжит цаг алга.</p>}
                  </div>
                </div>
              ))}
            </div>
            {warning && <p className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{warning}</p>}
            <div className="mt-6 flex justify-end">
              <Button disabled={!doctorId} onClick={continueToConfirmation}>Үргэлжлүүлэх →</Button>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

function generateAvailability(startDate: string, endDate: string): DaySlots[] {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];

  const days: DaySlots[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const slots: DaySlots["slots"] = [];
    const slot = new Date(cursor);
    slot.setHours(9, 0, 0, 0);
    const today = new Date();
    const isToday = toInputDate(cursor) === toInputDate(today);
    if (isToday) {
      slot.setTime(Math.max(slot.getTime(), today.getTime() + 5 * 60 * 1000));
      slot.setSeconds(0, 0);
    }
    const last = new Date(cursor);
    last.setHours(17, 30, 0, 0);
    while (slot <= last) {
      slots.push({ iso: slot.toISOString(), label: formatTime(slot) });
      slot.setMinutes(slot.getMinutes() + 30);
    }
    days.push({
      date: toInputDate(cursor),
      label: formatMongolianDate(cursor),
      slots,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}
