"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";
import { DoctorSummary } from "./AppointmentBookingPage";

type DoctorDetail = {
  id: string;
  specialty: string;
  experience: number;
  fee: number;
  rating: number;
  user: { firstName: string; lastName?: string };
};

const DEFAULT_ONLINE_PRICE = 30000;

export function AppointmentConfirmationPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [doctorId, setDoctorId] = useState("");
  const [time, setTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("ONLINE");
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [room, setRoom] = useState("");
  const [queryPrice, setQueryPrice] = useState(0);
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scheduledAt = params.get("time") || params.get("scheduledAt") || "";
    setMounted(true);
    setDoctorId(params.get("service") || params.get("doctorId") || "");
    setTime(scheduledAt);
    setAppointmentType(params.get("type") || "ONLINE");
    setHospitalName(params.get("hospitalName") || "");
    setHospitalId(params.get("hospitalId") || "");
    setSpecialty(params.get("specialty") || "");
    setRoom(params.get("room") || "");
    setQueryPrice(Number(params.get("price") || "") || 0);
    const parts = formatAppointmentParts(scheduledAt);
    setSelectedDate(parts.date);
    setSelectedTime(parts.time);
  }, []);

  useEffect(() => {
    if (!doctorId) return;
    api.get(`/doctors/${doctorId}`).then((response) => setDoctor(response.data.data as DoctorDetail)).catch(() => setDoctor(null));
  }, [doctorId]);

  const isHospitalVisit = appointmentType === "HOSPITAL_VISIT";
  const price = queryPrice > 0 ? queryPrice : getOnlinePrice(doctor?.fee);

  function continueToPayment() {
    const query = new URLSearchParams({
      doctorId,
      hospitalId,
      hospitalName,
      specialty,
      room,
      date: selectedDate,
      selectedTime,
      type: appointmentType,
      price: String(price),
      scheduledAt: time,
    });
    router.push(`/patient/home/appointment/payment?${query.toString()}`);
  }

  if (!mounted) {
    return <section className="bg-slate-50 px-4 py-8" suppressHydrationWarning />;
  }

  return (
    <section className="bg-slate-50 px-4 py-8" suppressHydrationWarning>
      <div className="mx-auto max-w-4xl">
        <button type="button" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-medical hover:text-sky-600" onClick={() => router.back()}><ChevronLeft size={18} />Буцах</button>
        <h1 className="text-3xl font-bold text-navy">Баталгаажуулах</h1>
        <div className="mt-6 rounded-2xl border border-sky-100 bg-white p-6 shadow-soft">
          {doctor && <DoctorSummary doctor={doctor} />}
          <div className="mt-6 grid gap-3 rounded-xl bg-cyanSoft p-4 text-sm font-semibold text-slate-700">
            <p className="flex items-center gap-2"><CalendarDays className="text-medical" size={18} />{isHospitalVisit ? "Биечлэн үзүүлэх" : "Онлайн зөвлөгөө"}</p>
            {hospitalName && <p>Эмнэлэг: {hospitalName}</p>}
            {specialty && <p>Чиглэл: {specialty}</p>}
            {room && <p>Өрөө: {room}</p>}
            <p>Огноо: {selectedDate || "-"}</p>
            <p>Цаг: {selectedTime || "-"}</p>
            <p>Үргэлжлэх хугацаа: 30 минут</p>
          </div>
          <div className="mt-6 rounded-xl border border-sky-100 p-4">
            <div className="flex justify-between text-sm text-slate-600"><span>Захиалгын төлбөр</span><b>{formatCurrency(price)}₮</b></div>
            <div className="mt-3 flex justify-between border-t border-sky-100 pt-3 text-lg font-bold text-navy"><span>Нийт</span><span>{formatCurrency(price)}₮</span></div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button disabled={!doctorId || !time} onClick={continueToPayment}>Үргэлжлүүлэх →</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function getOnlinePrice(fee?: number) {
  return fee && fee > 0 ? fee : DEFAULT_ONLINE_PRICE;
}

function formatCurrency(value: number) {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatAppointmentParts(value: string) {
  if (!value) return { date: "", time: "" };
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return { date: "", time: "" };
  return { date: `${match[1]}-${match[2]}-${match[3]}`, time: `${match[4]}:${match[5]}` };
}
