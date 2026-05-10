"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";

type DoctorAppointment = {
  id: string;
  scheduledAt: string;
  type?: string;
  paymentStatus?: string;
  patient: {
    chatRooms?: Array<{ id: string }>;
    user: {
      firstName: string;
      lastName?: string;
    };
  };
};

export function DoctorAppointmentList() {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/appointments/doctor")
      .then((response) => setAppointments(response.data.data as DoctorAppointment[]))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Card className="p-5 text-sm font-semibold text-slate-500">Цаг захиалгууд ачаалж байна...</Card>;
  }

  if (appointments.length === 0) {
    return <Card className="p-5 text-sm font-semibold text-slate-500">Шинэ цаг захиалга одоогоор алга.</Card>;
  }

  return (
    <div className="grid gap-3">
      {appointments.map((appointment) => {
        const date = new Date(appointment.scheduledAt);
        const patientName = `${appointment.patient.user.lastName || ""} ${appointment.patient.user.firstName}`.trim();
        const chatRoomId = appointment.patient.chatRooms?.[0]?.id;
        return (
          <Card key={appointment.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyanSoft text-medical">
                <CalendarClock size={20} />
              </div>
              <div>
                <h3 className="font-bold text-navy">Өвчтөн: {patientName}</h3>
                <p className="text-sm text-slate-500">
                  {date.toLocaleDateString("mn-MN")} · {date.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" })} · Онлайн зөвлөгөө
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {chatRoomId && (
                <Link href={`/chat?roomId=${chatRoomId}`} className="inline-flex items-center gap-2 rounded-full border border-sky-100 px-3 py-2 text-sm font-bold text-medical transition hover:bg-cyanSoft">
                  <MessageCircle size={15} />
                  Чат
                </Link>
              )}
              <Badge>{appointment.paymentStatus === "PAID" ? "Төлбөр төлөгдсөн" : "Төлбөр хүлээгдэж байгаа"}</Badge>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
