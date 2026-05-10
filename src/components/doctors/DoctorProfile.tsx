"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, GraduationCap, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import type { Doctor } from "./DoctorCard";

export function DoctorProfile({ id }: { id: string }) {
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    api.get(`/doctors/${id}`).then((response) => setDoctor(response.data.data as Doctor | null)).catch(() => setDoctor(null));
  }, [id]);

  if (!doctor) {
    return <Card className="p-8 text-center font-bold text-navy">Одоогоор эмч бүртгэлгүй байна.</Card>;
  }

  const name = `${doctor.user.lastName || ""} ${doctor.user.firstName}`.trim();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="p-6">
        <div className="flex flex-wrap gap-5">
          <div className="grid h-24 w-24 place-items-center rounded-lg bg-sky-100 text-3xl font-bold text-medical">{name.slice(0, 2)}</div>
          <div><h1 className="text-3xl font-bold text-navy">{name}</h1><p className="mt-1 text-slate-600">{doctor.specialty} · {doctor.hospital?.name || "Эмнэлэг сонгоогүй"}</p><p className="mt-3 inline-flex items-center gap-1 font-semibold text-amber-600"><Star size={18} fill="currentColor" /> {doctor.rating} үнэлгээ</p></div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3"><Info title="Туршлага" value={`${doctor.experience} жил`} /><Info title="Зөвлөгөөний төлбөр" value={`${doctor.fee.toLocaleString()}₮`} /><Info title="Төлөв" value={doctor.online ? "Онлайн" : "Офлайн"} /></div>
        <h2 className="mt-8 text-xl font-bold text-navy">Танилцуулга</h2>
        <p className="mt-3 leading-7 text-slate-600">{doctor.bio || "Эмч товч танилцуулгаа хараахан оруулаагүй байна."}</p>
      </Card>
      <Card className="p-6"><h2 className="text-xl font-bold text-navy">Цаг захиалах</h2><p className="mt-3 text-sm text-slate-600">Онлайн зөвлөгөөний цаг сонгох хэсэг рүү шилжинэ.</p><Button className="mt-5 w-full" onClick={() => router.push(`/patient/home/appointment/timetable?service=${doctor.id}`)}><CalendarPlus size={17} className="mr-2" />Онлайн</Button><p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><GraduationCap size={16} />{doctor.verified ? "Баталгаажсан эмчийн профайл." : "Баталгаажаагүй эмчийн профайл."}</p></Card>
    </div>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-400">{title}</p><p className="mt-1 font-bold text-navy">{value}</p></div>;
}
