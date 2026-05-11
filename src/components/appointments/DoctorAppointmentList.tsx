"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, MessageCircle, Video } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";

type DoctorAppointment = {
  id: string;
  doctorId: string;
  scheduledAt: string;
  type?: string;
  paymentStatus?: string;
  videoCall?: { roomId: string; status?: string } | null;
  patient: {
    chatRooms?: Array<{ id: string }>;
    user: {
      firstName: string;
      lastName?: string;
    };
  };
};

export function DoctorAppointmentList() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/appointments/doctor")
      .then((response) => setAppointments(response.data.data as DoctorAppointment[]))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  async function openVideoCall(appointment: DoctorAppointment) {
    const roomId = appointment.videoCall?.roomId;
    const status = appointment.videoCall?.status;
    if (roomId && status !== "ended" && status !== "declined") {
      await api.patch("/video-calls", { roomId, status: "ringing" }).catch(() => null);
      router.push(`/video-call/${roomId}?start=1`);
      return;
    }
    try {
      const response = await api.post("/video-calls", { doctorId: appointment.doctorId, appointmentId: appointment.id });
      const nextRoomId = response.data.data.roomId as string;
      console.log("video-call: doctor appointment open", { roomId: nextRoomId, appointmentId: appointment.id, doctorId: appointment.doctorId });
      await api.patch("/video-calls", { roomId: nextRoomId, status: "ringing" }).catch(() => null);
      setAppointments((current) => current.map((item) => item.id === appointment.id ? { ...item, videoCall: { roomId: nextRoomId, status: "ringing" } } : item));
      router.push(`/video-call/${nextRoomId}?start=1`);
    } catch {
      window.alert("Видео өрөө үүсгэхэд алдаа гарлаа.");
    }
  }

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
        const isOnline = appointment.type === "ONLINE" || !appointment.type;
        return (
          <Card key={appointment.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyanSoft text-medical">
                <CalendarClock size={20} />
              </div>
              <div>
                <h3 className="font-bold text-navy">Өвчтөн: {patientName}</h3>
                <p className="text-sm text-slate-500">
                  {formatDateTime(date)} · {isOnline ? "Онлайн зөвлөгөө" : "Биечлэн үзүүлэх"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOnline && chatRoomId && (
                <Link href={`/chat?roomId=${chatRoomId}`} className="inline-flex items-center gap-2 rounded-full border border-sky-100 px-3 py-2 text-sm font-bold text-medical transition hover:bg-cyanSoft">
                  <MessageCircle size={15} />
                  Чат
                </Link>
              )}
              {isOnline && (
                <button type="button" title="Видео дуудлага" aria-label="Видео дуудлага" className="grid h-9 w-9 place-items-center rounded-full bg-medical text-white transition hover:bg-sky-600" onClick={() => openVideoCall(appointment)}>
                  <Video size={15} />
                </button>
              )}
              <Badge>{appointment.paymentStatus === "PAID" ? "Төлбөр төлөгдсөн" : "Төлбөр хүлээгдэж байгаа"}</Badge>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function formatDateTime(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}
