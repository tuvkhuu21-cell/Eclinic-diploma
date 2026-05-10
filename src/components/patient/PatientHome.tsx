"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Baby,
  Bone,
  Brain,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FlaskConical,
  HeartPulse,
  MessageCircle,
  Microscope,
  Pill,
  Search,
  ShieldPlus,
  ShoppingCart,
  Sparkles,
  Stethoscope,
  Syringe,
  TestTube2,
  type LucideIcon,
} from "lucide-react";
import { AppointmentFlowModal } from "@/components/appointments/AppointmentFlowModal";
import { appointmentSpecialties } from "@/components/appointments/specialtyOptions";
import { ImmediateConsultationModal } from "@/components/consultation/ImmediateConsultationModal";
import { UserAvatarMenu } from "@/components/layout/UserAvatarMenu";
import { NotificationBox } from "@/components/notifications/NotificationBox";
import { HealthPackageModal } from "@/components/packages/HealthPackageModal";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";

const shortcuts = [
  { title: "Цаг захиалах", action: "appointment", icon: CalendarPlus },
  { title: "Яг одоо зөвлөгөө авах", action: "consultation", icon: MessageCircle },
  { title: "Багц шинжилгээ захиалах", action: "health-package", icon: FlaskConical },
  { title: "Шинжилгээний хариу авах", href: "/dashboard/patient?section=labs", icon: ClipboardCheck },
];

const specialtyIcons: LucideIcon[] = [Stethoscope, ShieldPlus, Pill, Bone, Sparkles, HeartPulse, Brain, Syringe, Microscope, Baby];

type PatientAppointment = {
  id: string;
  scheduledAt: string;
  type?: string;
  room?: string;
  specialty?: string;
  paymentStatus?: string;
  packageName?: string;
  labName?: string;
  doctor: {
    specialty: string;
    hospital?: { name: string } | null;
    chatRooms?: Array<{ id: string }>;
    user: { firstName: string; lastName?: string };
  };
};

export function PatientHome() {
  const user = useAuthStore((state) => state.user);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [healthPackageOpen, setHealthPackageOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [specialtyIndex, setSpecialtyIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"next" | "previous">("next");
  const carouselRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const lastWheelTimeRef = useRef(0);
  const { items: cartItems, hydrate: hydrateCart, hasHydrated: cartHasHydrated, removeItem } = useCartStore();
  const visibleSpecialties = appointmentSpecialties.slice(specialtyIndex, specialtyIndex + 5);
  const canMovePrevious = specialtyIndex > 0;
  const canMoveNext = specialtyIndex < appointmentSpecialties.length - 5;

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("appointment") === "select") setAppointmentOpen(true);
  }, []);

  useEffect(() => {
    api.get("/appointments/my").then((response) => setAppointments(response.data.data as PatientAppointment[])).catch(() => setAppointments([]));
  }, []);

  useEffect(() => {
    if (!cartHasHydrated) hydrateCart();
  }, [cartHasHydrated, hydrateCart]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!cartRef.current?.contains(event.target as Node)) setCartOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      event.stopPropagation();

      const now = Date.now();
      if (now - lastWheelTimeRef.current < 450) return;
      lastWheelTimeRef.current = now;

      const direction = event.deltaY > 0 || event.deltaX > 0 ? 1 : -1;
      moveSpecialties(direction);
    }

    carousel.addEventListener("wheel", handleWheel, { passive: false });
    return () => carousel.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div className="min-h-screen bg-[#eef7fb] pb-20">
      <section className="relative z-20 rounded-b-[46px] bg-[#0b5b86] pb-20 text-white shadow-[0_22px_70px_rgba(11,91,134,0.22)]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <div className="relative z-30 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-md sm:flex-nowrap sm:px-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo/mediconnect.svg" alt="MediConnect" width={176} height={44} className="rounded-xl bg-white px-2 py-1 shadow-sm" priority />
            </Link>
            <nav className="hidden items-center gap-8 text-sm font-bold md:flex">
              <Link href="/" className="transition hover:text-sky-100">Нүүр</Link>
              <Link href="/appointments" className="transition hover:text-sky-100">Захиалга</Link>
            </nav>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <Link href="/chat" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white text-[#0b5b86] shadow-sm transition hover:bg-sky-50"><MessageCircle size={19} /></Link>
              <div ref={cartRef} className="relative z-[110]">
                <button type="button" aria-label="Package cart" className="relative grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white text-[#0b5b86] shadow-sm transition hover:bg-sky-50" onClick={() => setCartOpen((current) => !current)}>
                  <ShoppingCart size={19} />
                  {cartItems.length > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white ring-2 ring-white">{cartItems.length}</span>}
                </button>
                {cartOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] z-[130] w-[min(390px,calc(100vw-1.5rem))] rounded-3xl border border-sky-100 bg-white p-4 text-slate-700 shadow-[0_24px_70px_rgba(11,91,134,0.24)]">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-bold text-navy">Миний сагс({cartItems.length})</h2>
                      <button type="button" aria-label="Close cart" className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-cyanSoft" onClick={() => setCartOpen(false)}>×</button>
                    </div>
                    <div className="mt-4 grid max-h-[min(60vh,430px)] gap-3 overflow-y-auto">
                      {cartItems.length === 0 && <p className="rounded-2xl bg-cyanSoft p-4 text-sm font-semibold text-medical">Сагс хоосон байна.</p>}
                      {cartItems.map((item) => (
                        <article key={item.id} className="flex gap-3 rounded-2xl border border-sky-100 p-3">
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyanSoft text-medical"><FlaskConical size={22} /></div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-navy">{item.name}</h3>
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.description || "Багц шинжилгээ"}</p>
                            <p className="mt-2 text-sm font-bold text-medical">{item.price}</p>
                          </div>
                          <button type="button" aria-label={`Remove ${item.name}`} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => removeItem(item.id)}>×</button>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <NotificationBox variant="dropdown" buttonClassName="h-11 w-11 border-white/20 bg-white text-[#0b5b86] shadow-sm hover:bg-sky-50" />
              <UserAvatarMenu user={user} role={user?.role} buttonClassName="h-11 w-11 bg-white text-[#0b5b86] shadow-sm hover:bg-sky-50" />
            </div>
          </div>
          <div className="mx-auto mt-12 max-w-3xl px-2 pb-4">
            <h1 className="text-center text-3xl font-extrabold tracking-tight md:text-5xl">Сайн байна уу, {user?.firstName || "өвчтөн"}?</h1>
            <div className="mt-8 flex items-center rounded-full bg-white px-5 py-4 text-slate-600 shadow-[0_18px_45px_rgba(8,47,73,0.18)] ring-1 ring-white/60">
              <Search className="text-medical" size={22} />
              <input className="ml-3 w-full bg-transparent text-sm outline-none" placeholder="Эмч, эмнэлэг, шинжилгээ хайх" />
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto mt-10 max-w-7xl px-4 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map(({ title, href, action, icon: Icon }) => (
            action === "appointment" ? (
              <button key={title} type="button" className="group flex min-h-[150px] flex-col items-center justify-center rounded-[28px] border border-sky-100 bg-white p-6 text-center shadow-[0_16px_42px_rgba(14,116,144,0.10)] transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_24px_60px_rgba(14,116,144,0.18)]" onClick={() => setAppointmentOpen(true)}>
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e6f7fd] text-[#0b6fa4] transition group-hover:bg-[#0b5b86] group-hover:text-white"><Icon size={26} /></div>
                <p className="mt-4 font-bold leading-5 text-[#073b5c]">{title}</p>
              </button>
            ) : action === "consultation" ? (
              <button key={title} type="button" className="group flex min-h-[150px] flex-col items-center justify-center rounded-[28px] border border-sky-100 bg-white p-6 text-center shadow-[0_16px_42px_rgba(14,116,144,0.10)] transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_24px_60px_rgba(14,116,144,0.18)]" onClick={() => setConsultationOpen(true)}>
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e6f7fd] text-[#0b6fa4] transition group-hover:bg-[#0b5b86] group-hover:text-white"><Icon size={26} /></div>
                <p className="mt-4 font-bold leading-5 text-[#073b5c]">{title}</p>
              </button>
            ) : action === "health-package" ? (
              <button key={title} type="button" className="group flex min-h-[150px] flex-col items-center justify-center rounded-[28px] border border-sky-100 bg-white p-6 text-center shadow-[0_16px_42px_rgba(14,116,144,0.10)] transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_24px_60px_rgba(14,116,144,0.18)]" onClick={() => setHealthPackageOpen(true)}>
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e6f7fd] text-[#0b6fa4] transition group-hover:bg-[#0b5b86] group-hover:text-white"><Icon size={26} /></div>
                <p className="mt-4 font-bold leading-5 text-[#073b5c]">{title}</p>
              </button>
            ) : (
            <Link key={title} href={href || "#"} className="group flex min-h-[150px] flex-col items-center justify-center rounded-[28px] border border-sky-100 bg-white p-6 text-center shadow-[0_16px_42px_rgba(14,116,144,0.10)] transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_24px_60px_rgba(14,116,144,0.18)]">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e6f7fd] text-[#0b6fa4] transition group-hover:bg-[#0b5b86] group-hover:text-white"><Icon size={26} /></div>
              <p className="mt-4 font-bold leading-5 text-[#073b5c]">{title}</p>
            </Link>
            )
          ))}
        </div>

        <section className="mt-12 rounded-[28px] border border-sky-100 bg-white p-5 shadow-[0_16px_42px_rgba(14,116,144,0.08)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-[#073b5c]">Та ямар эмч хайж байна вэ?</h2>
            <div className="flex items-center gap-2">
              <Link href="/patient/home/specialties" className="text-sm font-bold text-medical hover:text-sky-600">
                Бүгдийг харах (38)
              </Link>
              <button type="button" aria-label="Previous specialties" className="grid h-10 w-10 place-items-center rounded-full border border-sky-100 bg-white text-medical shadow-sm hover:bg-cyanSoft disabled:cursor-not-allowed disabled:opacity-40" disabled={!canMovePrevious} onClick={() => moveSpecialties(-1)}>
                <ChevronLeft size={20} />
              </button>
              <button type="button" aria-label="Next specialties" className="grid h-10 w-10 place-items-center rounded-full border border-sky-100 bg-white text-medical shadow-sm hover:bg-cyanSoft disabled:cursor-not-allowed disabled:opacity-40" disabled={!canMoveNext} onClick={() => moveSpecialties(1)}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div
            ref={carouselRef}
            className="overflow-hidden"
          >
            <div key={specialtyIndex} className={`grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 ${slideDirection === "next" ? "animate-specialty-next" : "animate-specialty-previous"}`}>
              {visibleSpecialties.map((item) => {
                const realIndex = appointmentSpecialties.indexOf(item);
                const Icon = specialtyIcons[realIndex % specialtyIcons.length];
                return (
                  <Link
                    key={item}
                    href={`/patient/home/search/doctor?specialty=${encodeURIComponent(item)}`}
                    className="group flex h-40 w-full flex-col items-center justify-center rounded-2xl border border-sky-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_18px_36px_rgba(14,116,144,0.14)]"
                  >
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-cyanSoft text-medical transition group-hover:bg-medical group-hover:text-white">
                      <Icon size={30} />
                    </div>
                    <p className="mt-4 text-sm font-bold leading-5 text-medical">{item}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-[0_16px_42px_rgba(14,116,144,0.08)]">
            <h2 className="text-xl font-bold text-[#073b5c]">Захиалсан цагууд</h2>
            <div className="mt-4 grid gap-3">
              {appointments.length === 0 && (
                <div className="rounded-2xl border border-sky-100 bg-cyanSoft p-4 text-sm font-semibold text-medical">Захиалсан цаг одоогоор алга.</div>
              )}
              {appointments.map((appointment) => {
                const date = new Date(appointment.scheduledAt);
                const doctorName = `${appointment.doctor.user.lastName || ""} ${appointment.doctor.user.firstName}`.trim();
                const chatRoomId = appointment.doctor.chatRooms?.[0]?.id;
                const isHospitalVisit = appointment.type === "HOSPITAL_VISIT";
                const isPackageOrder = appointment.type === "PACKAGE_ORDER";
                return (
                  <article key={appointment.id} className="flex items-center justify-between gap-4 rounded-2xl border border-sky-100 bg-cyanSoft p-4">
                    <div>
                      <p className="text-sm font-bold text-medical">{date.toLocaleDateString("mn-MN", { month: "long", day: "numeric" })} · {date.toLocaleDateString("mn-MN", { weekday: "long" })}</p>
                      <p className="mt-1 text-xl font-bold text-navy">{date.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" })}</p>
                      {isHospitalVisit && appointment.doctor.hospital?.name && <p className="mt-2 font-semibold text-navy">{appointment.doctor.hospital.name}</p>}
                      {isPackageOrder && <p className="mt-2 font-semibold text-navy">{appointment.labName || appointment.doctor.hospital?.name || "Лаборатори"}</p>}
                      <p className={isHospitalVisit || isPackageOrder ? "mt-1 font-semibold text-navy" : "mt-2 font-semibold text-navy"}>{isPackageOrder ? appointment.packageName || "Багц шинжилгээ" : doctorName}</p>
                      <p className="text-sm text-slate-600">{isPackageOrder ? "Багц шинжилгээ" : isHospitalVisit ? "Биечлэн үзүүлэх" : "Онлайн зөвлөгөө"}{!isPackageOrder ? ` · ${appointment.specialty || appointment.doctor.specialty}` : ""}{appointment.room ? ` · Өрөө ${appointment.room}` : ""} · {appointment.paymentStatus === "PAID" ? "Төлбөр төлөгдсөн" : "Төлбөр хүлээгдэж байгаа"}</p>
                      {!isHospitalVisit && !isPackageOrder && chatRoomId && (
                        <Link href={`/chat?roomId=${chatRoomId}`} className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-medical shadow-sm transition hover:bg-sky-50">
                          <MessageCircle size={15} />
                          Чатлах
                        </Link>
                      )}
                    </div>
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white font-bold text-medical">{doctorName.slice(0, 2)}</div>
                  </article>
                );
              })}
            </div>
          </section>
          <section className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-[0_16px_42px_rgba(14,116,144,0.08)]">
            <h2 className="text-xl font-bold text-[#073b5c]">Шинжилгээ</h2>
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-100 p-4 text-slate-600"><TestTube2 className="text-medical" /> CBC-2026-001 хариу бэлэн</div>
          </section>
        </div>

        <section className="mt-8 rounded-[28px] border border-sky-100 bg-white p-6 shadow-[0_16px_42px_rgba(14,116,144,0.08)]">
          <h2 className="text-2xl font-bold text-[#073b5c]">Урьдчилан сэргийлэх багц шинжилгээнүүд</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {["Ерөнхий эрүүл мэнд", "Зүрх судасны багц", "Дархлаа, витамин"].map((item) => <div key={item} className="rounded-lg border border-sky-100 p-5"><Sparkles className="text-medical" /><p className="mt-3 font-bold text-navy">{item}</p><p className="mt-2 text-sm text-slate-600">Эмчийн зөвлөмжтэй багц шинжилгээ</p></div>)}
          </div>
        </section>
      </main>
      <AppointmentFlowModal open={appointmentOpen} onClose={() => setAppointmentOpen(false)} />
      <ImmediateConsultationModal open={consultationOpen} onClose={() => setConsultationOpen(false)} />
      <HealthPackageModal open={healthPackageOpen} onClose={() => setHealthPackageOpen(false)} />
      <style jsx>{`
        .animate-specialty-next {
          animation: specialtyNext 320ms ease-out;
        }

        .animate-specialty-previous {
          animation: specialtyPrevious 320ms ease-out;
        }

        @keyframes specialtyNext {
          from {
            opacity: 0.72;
            transform: translateX(28px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes specialtyPrevious {
          from {
            opacity: 0.72;
            transform: translateX(-28px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );

  function moveSpecialties(direction: -1 | 1) {
    setSpecialtyIndex((current) => {
      const next = Math.min(Math.max(current + direction, 0), appointmentSpecialties.length - 5);
      if (next !== current) setSlideDirection(direction === 1 ? "next" : "previous");
      return next;
    });
  }
}
