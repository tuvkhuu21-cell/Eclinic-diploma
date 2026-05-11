"use client";

import { useMemo, useState } from "react";
import { Bell, CalendarClock, Clock3, MessageCircle, MonitorPlay, Stethoscope, UsersRound, UserRound } from "lucide-react";
import { NotificationBox } from "@/components/notifications/NotificationBox";
import { Card } from "@/components/ui/Card";
import { ChatBox } from "@/components/chat/ChatBox";
import { DoctorAppointmentList } from "@/components/appointments/DoctorAppointmentList";
import { DoctorProfileForm } from "./DoctorProfileForm";

type DoctorSection = "profile" | "appointments" | "patients" | "online" | "today" | "notifications" | "chat";

const sections: Array<{ key: DoctorSection; label: string; icon: typeof UserRound }> = [
  { key: "profile", label: "Хувийн мэдээлэл", icon: UserRound },
  { key: "appointments", label: "Цаг захиалгууд", icon: CalendarClock },
  { key: "patients", label: "Өвчтөнүүд", icon: UsersRound },
  { key: "online", label: "Онлайн зөвлөгөө", icon: MonitorPlay },
  { key: "today", label: "Өнөөдрийн хуваарь", icon: Clock3 },
  { key: "notifications", label: "Мэдэгдэл", icon: Bell },
  { key: "chat", label: "Чат", icon: MessageCircle },
];

export function DoctorDashboard() {
  const [active, setActive] = useState<DoctorSection>("profile");
  const activeTitle = useMemo(() => sections.find((section) => section.key === active)?.label || "Эмчийн самбар", [active]);

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[28px] bg-gradient-to-br from-[#0b5b86] to-[#18a8c7] p-6 text-white shadow-[0_20px_60px_rgba(11,91,134,0.22)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold"><Stethoscope size={14} /> Doctor workspace</p>
              <h1 className="mt-3 text-3xl font-extrabold">Эмчийн самбар</h1>
              <p className="mt-2 text-sm font-semibold text-cyan-50">Цаг захиалга, онлайн зөвлөгөө, чат, мэдэгдлээ нэг дор удирдана.</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold">REST + WebRTC video call</div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-3xl border border-sky-100 bg-white p-4 shadow-soft">
            <div className="grid gap-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.key}
                    type="button"
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${active === section.key ? "bg-cyanSoft text-medical" : "text-slate-600 hover:bg-sky-50 hover:text-medical"}`}
                    onClick={() => setActive(section.key)}
                  >
                    <Icon size={18} />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </aside>

          <main>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-navy">{activeTitle}</h2>
            </div>
            {active === "profile" && <DoctorProfileForm />}
            {active === "appointments" && <DoctorAppointmentList />}
            {active === "patients" && <DoctorPatientsPanel />}
            {active === "online" && <DoctorOnlinePanel />}
            {active === "today" && <DoctorTodayPanel />}
            {active === "notifications" && <NotificationBox />}
            {active === "chat" && <ChatBox />}
          </main>
        </div>
      </div>
    </section>
  );
}

function DoctorPatientsPanel() {
  return <Card className="p-5"><p className="text-sm font-semibold text-slate-600">Төлбөр төлөгдсөн онлайн болон биечлэн цаг захиалсан өвчтөнүүд “Цаг захиалгууд” хэсгээс харагдана.</p></Card>;
}

function DoctorOnlinePanel() {
  return <Card className="p-5"><p className="font-bold text-navy">Онлайн зөвлөгөө</p><p className="mt-2 text-sm text-slate-600">Active төлөвтэй үед өвчтөнүүд “Яг одоо зөвлөгөө авах” урсгалаар таныг сонгож болно. Төлөвөө “Хувийн мэдээлэл” хэсгээс солино.</p></Card>;
}

function DoctorTodayPanel() {
  return <Card className="p-5"><p className="font-bold text-navy">Өнөөдрийн хуваарь</p><p className="mt-2 text-sm text-slate-600">Өнөөдрийн баталгаажсан цагууд “Цаг захиалгууд” хэсэгт цагийн дарааллаар харагдана.</p></Card>;
}
