"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarClock,
  Clock3,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  MonitorPlay,
  Settings,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";
import { NotificationBox } from "@/components/notifications/NotificationBox";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChatBox } from "@/components/chat/ChatBox";
import { DoctorAppointmentList } from "@/components/appointments/DoctorAppointmentList";
import { DoctorProfileForm } from "./DoctorProfileForm";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";

type DoctorSection = "dashboard" | "profile" | "appointments" | "online" | "patients" | "chat" | "notifications" | "settings";

type DoctorAppointment = {
  id: string;
  scheduledAt?: string;
  type?: string;
  status?: string;
  paymentStatus?: string;
  price?: number;
  patient?: {
    user?: {
      firstName?: string;
      lastName?: string | null;
    };
  };
};

const sections: Array<{ key: DoctorSection; label: string; icon: typeof LayoutDashboard }> = [
  { key: "dashboard", label: "Хянах самбар", icon: LayoutDashboard },
  { key: "profile", label: "Хувийн мэдээлэл", icon: UserRound },
  { key: "appointments", label: "Цаг захиалгууд", icon: CalendarClock },
  { key: "online", label: "Онлайн зөвлөгөө", icon: MonitorPlay },
  { key: "patients", label: "Өвчтөнүүд", icon: UsersRound },
  { key: "chat", label: "Чат", icon: MessageCircle },
  { key: "notifications", label: "Мэдэгдэл", icon: Bell },
  { key: "settings", label: "Тохиргоо", icon: Settings },
];

export function DoctorDashboard() {
  const router = useRouter();
  const { hasHydrated, token, role, user, logout } = useAuthStore();
  const [active, setActive] = useState<DoctorSection>("dashboard");
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [online, setOnline] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const activeRole = user?.role || role;
  const isAllowed = activeRole === "DOCTOR" || activeRole === "ADMIN";
  const doctorName = `${user?.lastName || ""} ${user?.firstName || "Эмч"}`.trim();

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("section") as DoctorSection | null;
    if (requested && sections.some((section) => section.key === requested)) setActive(requested);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) {
      router.replace("/doctor/login");
      return;
    }
    if (activeRole === "PATIENT") {
      router.replace("/patient/home");
    }
  }, [activeRole, hasHydrated, router, token]);

  useEffect(() => {
    if (!hasHydrated || activeRole !== "DOCTOR") return;
    api.get("/appointments/doctor")
      .then((response) => setAppointments((response.data.data || []) as DoctorAppointment[]))
      .catch(() => setAppointments([]));
    api.get("/doctors/me")
      .then((response) => setOnline(Boolean(response.data.data?.online || response.data.data?.isOnline)))
      .catch(() => setOnline(false));
  }, [activeRole, hasHydrated]);

  const stats = useMemo(() => {
    const paid = appointments.filter(isPaidAppointment);
    const todayKey = formatDateKey(new Date());
    const monthKey = todayKey.slice(0, 7);
    const today = paid.filter((item) => item.scheduledAt && formatDateKey(new Date(item.scheduledAt)) === todayKey);
    const month = paid.filter((item) => item.scheduledAt && formatDateKey(new Date(item.scheduledAt)).startsWith(monthKey));
    return {
      today: today.length,
      month: month.length,
      todayRevenue: sumRevenue(today),
      totalRevenue: sumRevenue(paid),
    };
  }, [appointments]);

  const paidAppointments = useMemo(() => appointments.filter(isPaidAppointment), [appointments]);
  const todaySchedule = useMemo(() => {
    const todayKey = formatDateKey(new Date());
    return paidAppointments
      .filter((item) => item.scheduledAt && formatDateKey(new Date(item.scheduledAt)) === todayKey)
      .sort((a, b) => new Date(a.scheduledAt || 0).getTime() - new Date(b.scheduledAt || 0).getTime());
  }, [paidAppointments]);
  const analytics = useMemo(() => buildAnalytics(paidAppointments), [paidAppointments]);

  async function toggleOnlineStatus() {
    const nextOnline = !online;
    setOnline(nextOnline);
    setSavingStatus(true);
    setStatusMessage("");
    try {
      await api.patch("/doctors/me", { online: nextOnline });
      setStatusMessage(nextOnline ? "Active төлөв хадгалагдлаа. Та яг одоо зөвлөгөөнд харагдана." : "Offline төлөв хадгалагдлаа. Та яг одоо зөвлөгөөнөөс нуугдана.");
    } catch {
      setOnline(!nextOnline);
      setStatusMessage("Төлөв хадгалахад алдаа гарлаа.");
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleLogout() {
    if (activeRole === "DOCTOR") await api.patch("/doctors/me", { online: false }).catch(() => null);
    logout();
    router.replace("/");
    router.refresh();
  }

  if (!hasHydrated || !token || !isAllowed) {
    return <section className="min-h-screen bg-slate-50" />;
  }

  return (
    <section className="min-h-screen bg-[#f3f8fc] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[30px] bg-gradient-to-br from-[#0b5b86] via-[#0f7dab] to-[#19b9d2] p-6 text-white shadow-[0_20px_60px_rgba(11,91,134,0.22)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                <Stethoscope size={14} /> Doctor workspace
              </p>
              <h1 className="mt-3 text-3xl font-extrabold">Сайн байна уу, Dr. {doctorName}</h1>
              <p className="mt-2 text-sm font-semibold text-cyan-50">Цаг захиалга, өвчтөн, онлайн зөвлөгөө, чат, мэдэгдлээ нэг дор удирдана.</p>
            </div>
            <button
              type="button"
              className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold shadow-sm transition ${online ? "bg-emerald-50 text-emerald-700" : "bg-white/90 text-slate-500"}`}
              onClick={toggleOnlineStatus}
              disabled={savingStatus || activeRole !== "DOCTOR"}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${online ? "bg-emerald-500" : "bg-slate-400"}`} />
              {savingStatus ? "Хадгалж байна..." : online ? "Active" : "Offline"}
            </button>
          </div>
          {statusMessage && <p className="mt-4 rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold text-white">{statusMessage}</p>}
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
              <button type="button" className="mt-2 flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600" onClick={handleLogout}>
                <LogOut size={18} />
                Системээс гарах
              </button>
            </div>
          </aside>

          <main>
            {active === "dashboard" && (
              <DoctorHomePanel
                stats={stats}
                online={online}
                onProfile={() => setActive("profile")}
                onAppointments={() => setActive("appointments")}
                onChat={() => setActive("chat")}
                onToggleOnline={toggleOnlineStatus}
                savingStatus={savingStatus}
                todaySchedule={todaySchedule}
                analytics={analytics}
              />
            )}
            {active === "profile" && <DoctorProfileForm />}
            {active === "appointments" && <DoctorAppointmentList />}
            {active === "online" && <DoctorOnlinePanel online={online} />}
            {active === "patients" && <DoctorPatientsPanel />}
            {active === "chat" && <ChatBox />}
            {active === "notifications" && <NotificationBox />}
            {active === "settings" && <DoctorSettingsPanel />}
          </main>
        </div>
      </div>
    </section>
  );
}

function DoctorHomePanel({
  stats,
  online,
  onProfile,
  onAppointments,
  onChat,
  onToggleOnline,
  savingStatus,
  todaySchedule,
  analytics,
}: {
  stats: { today: number; month: number; todayRevenue: number; totalRevenue: number };
  online: boolean;
  onProfile: () => void;
  onAppointments: () => void;
  onChat: () => void;
  onToggleOnline: () => void;
  savingStatus: boolean;
  todaySchedule: DoctorAppointment[];
  analytics: Array<{ date: string; count: number; revenue: number }>;
}) {
  const cards = [
    { label: "Өнөөдрийн үзлэг", value: String(stats.today), icon: CalendarClock },
    { label: "Энэ сарын үзлэг", value: String(stats.month), icon: UsersRound },
    { label: "Өнөөдрийн орлого", value: formatMoney(stats.todayRevenue), icon: MonitorPlay },
    { label: "Нийт орлого", value: formatMoney(stats.totalRevenue), icon: Bell },
  ];

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-extrabold text-navy">{card.value}</p>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyanSoft text-medical">
                  <Icon size={22} />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold text-navy">Өнөөдрийн цагийн хуваарь</h2>
            <Button type="button" variant="outline" onClick={onAppointments}>Цагийн хуваарь харах</Button>
          </div>
          <div className="mt-4 grid gap-3">
            {todaySchedule.map((appointment) => (
              <article key={appointment.id} className="flex flex-col gap-3 rounded-2xl border border-sky-100 bg-sky-50/50 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-bold text-navy">{getPatientName(appointment)}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{appointment.scheduledAt ? formatTime(new Date(appointment.scheduledAt)) : "--:--"} · {appointment.type === "ONLINE" ? "Онлайн" : "Биечлэн"}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">Төлбөр төлсөн</span>
                  <span className="rounded-full bg-white px-3 py-1.5 text-medical">{appointment.status || "CONFIRMED"}</span>
                </div>
              </article>
            ))}
            {todaySchedule.length === 0 && <p className="rounded-2xl border border-dashed border-sky-100 bg-sky-50/60 p-5 text-sm font-semibold text-slate-600">Өнөөдрийн төлбөр төлөгдсөн цаг одоогоор алга.</p>}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-extrabold text-navy">Quick actions</h2>
          <div className="mt-4 grid gap-3">
            <Button type="button" variant="outline" onClick={onProfile}>Профайл засах</Button>
            <Button type="button" variant={online ? "outline" : "primary"} onClick={onToggleOnline} disabled={savingStatus}>
              {online ? "Онлайн зөвлөгөө унтраах" : "Онлайн зөвлөгөө асаах"}
            </Button>
            <Button type="button" variant="outline" onClick={onAppointments}>Цагийн хуваарь харах</Button>
            <Button type="button" variant="outline" onClick={onChat}>Чат нээх</Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <AnalyticsChart title="Өдөр бүрийн үзлэг" data={analytics} valueKey="count" suffix="" />
        <AnalyticsChart title="Өдөр бүрийн орлого" data={analytics} valueKey="revenue" suffix="₮" />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <InfoPanel title="Онлайн зөвлөгөөний хүсэлтүүд" text="Active төлөвтэй үед өвчтөнүүд шууд зөвлөгөөний урсгалаар таныг сонгоно." />
        <InfoPanel title="Сүүлийн чат" text="Төлбөр төлөгдсөн онлайн цагийн дараа үүссэн өвчтөнүүдийн чат эндээс нээгдэнэ." />
        <InfoPanel title="Миний өвчтөнүүд" text="Таны цаг захиалсан өвчтөнүүд болон өмнөх үзлэгүүдийн жагсаалт энд харагдана." />
      </div>
    </div>
  );
}

function InfoPanel({ title, text }: { title: string; text: string }) {
  return (
    <Card className="p-5">
      <h3 className="font-extrabold text-navy">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{text}</p>
    </Card>
  );
}

function AnalyticsChart({ title, data, valueKey, suffix }: { title: string; data: Array<{ date: string; count: number; revenue: number }>; valueKey: "count" | "revenue"; suffix: string }) {
  const maxValue = Math.max(...data.map((item) => item[valueKey]), 1);
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-extrabold text-navy">{title}</h3>
        <span className="rounded-full bg-cyanSoft px-3 py-1 text-xs font-bold text-medical">Сүүлийн 7 өдөр</span>
      </div>
      <div className="mt-5 flex h-52 items-end gap-3">
        {data.map((item) => {
          const value = item[valueKey];
          const height = Math.max(10, Math.round((value / maxValue) * 100));
          return (
            <div key={item.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex h-36 w-full items-end rounded-t-2xl bg-sky-50 px-1">
                <div className="w-full rounded-t-2xl bg-gradient-to-t from-[#0b5b86] to-[#1ab8d1] transition-all" style={{ height: `${height}%` }} title={`${value}${suffix}`} />
              </div>
              <p className="text-[11px] font-bold text-slate-500">{item.date.slice(5).replace("-", ".")}</p>
              <p className="truncate text-xs font-extrabold text-navy">{suffix ? formatMoney(value) : value}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DoctorPatientsPanel() {
  return <Card className="p-5"><p className="text-sm font-semibold text-slate-600">Төлбөр төлөгдсөн онлайн болон биечлэн цаг захиалсан өвчтөнүүд “Цаг захиалгууд” хэсгээс харагдана.</p></Card>;
}

function DoctorOnlinePanel({ online }: { online: boolean }) {
  return <Card className="p-5"><p className="font-bold text-navy">Онлайн зөвлөгөө</p><p className="mt-2 text-sm text-slate-600">Одоогийн төлөв: <span className={online ? "font-bold text-emerald-700" : "font-bold text-slate-500"}>{online ? "Active" : "Offline"}</span>. Active үед өвчтөнүүд “Яг одоо зөвлөгөө авах” урсгалаар таныг сонгож болно.</p></Card>;
}

function DoctorSettingsPanel() {
  return <Card className="p-5"><p className="font-bold text-navy">Тохиргоо</p><p className="mt-2 text-sm text-slate-600">Эмчийн мэдэгдэл, профайл, системийн тохиргоо энд нэмэгдэнэ.</p></Card>;
}

function isPaidAppointment(appointment: DoctorAppointment) {
  return appointment.paymentStatus === "PAID" || appointment.status === "CONFIRMED" || appointment.status === "COMPLETED";
}

function sumRevenue(appointments: DoctorAppointment[]) {
  return appointments.reduce((sum, appointment) => sum + (appointment.price && appointment.price > 0 ? appointment.price : 30000), 0);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString("en-US")}₮`;
}

function getPatientName(appointment: DoctorAppointment) {
  const user = appointment.patient?.user;
  return `${user?.lastName || ""} ${user?.firstName || "Өвчтөн"}`.trim();
}

function buildAnalytics(appointments: DoctorAppointment[]) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return formatDateKey(date);
  });
  return days.map((date) => {
    const daily = appointments.filter((appointment) => appointment.scheduledAt && formatDateKey(new Date(appointment.scheduledAt)) === date);
    return { date, count: daily.length, revenue: sumRevenue(daily) };
  });
}
