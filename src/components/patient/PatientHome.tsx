"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, CalendarPlus, ClipboardCheck, FlaskConical, MessageCircle, Search, Sparkles, Stethoscope, TestTube2, UserRound } from "lucide-react";
import { doctors, specialties } from "@/lib/constants";
import { useAuthStore } from "@/store/auth.store";

const shortcuts = [
  { title: "Цаг захиалах", href: "/appointments/new", icon: CalendarPlus },
  { title: "Яг одоо зөвлөгөө авах", href: "/consultation", icon: MessageCircle },
  { title: "Багц шинжилгээ захиалах", href: "/lab-results", icon: FlaskConical },
  { title: "Шинжилгээний хариу авах", href: "/lab-results", icon: ClipboardCheck },
];

export function PatientHome() {
  const user = useAuthStore((state) => state.user);
  const initials = `${user?.lastName?.[0] || ""}${user?.firstName?.[0] || "Х"}`;

  return (
    <div className="bg-slate-50 pb-16">
      <section className="relative overflow-hidden rounded-b-[42px] bg-gradient-to-br from-sky-600 via-medical to-cyan-500 pb-16 text-white shadow-soft">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo/mediconnect.svg" alt="MediConnect" width={180} height={44} className="rounded-lg bg-white px-2" priority />
            </Link>
            <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
              <Link href="/">Нүүр</Link>
              <Link href="/appointments">Захиалга</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/chat" className="grid h-10 w-10 place-items-center rounded-full bg-white/15"><MessageCircle size={19} /></Link>
              <Link href="/notifications" className="grid h-10 w-10 place-items-center rounded-full bg-white/15"><Bell size={19} /></Link>
              <Link href="/dashboard/patient" className="grid h-11 w-11 place-items-center rounded-full bg-white font-bold text-medical">{initials}</Link>
            </div>
          </div>
          <div className="mx-auto mt-10 max-w-3xl">
            <h1 className="text-center text-3xl font-bold md:text-5xl">Сайн байна уу, {user?.firstName || "өвчтөн"}?</h1>
            <div className="mt-7 flex items-center rounded-2xl bg-white px-4 py-3 text-slate-600 shadow-soft">
              <Search className="text-medical" size={22} />
              <input className="ml-3 w-full bg-transparent text-sm outline-none" placeholder="Эмч, эмнэлэг, шинжилгээ хайх" />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto -mt-10 max-w-7xl px-4">
        <div className="grid gap-4 md:grid-cols-4">
          {shortcuts.map(({ title, href, icon: Icon }) => (
            <Link key={title} href={href} className="rounded-lg bg-white p-5 shadow-soft transition hover:-translate-y-1">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-cyanSoft text-medical"><Icon size={24} /></div>
              <p className="mt-4 font-bold text-navy">{title}</p>
            </Link>
          ))}
        </div>

        <section className="mt-10 rounded-lg bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-navy">Та ямар эмч хайж байна вэ?</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            {specialties.map((item) => <Link key={item} href="/doctors" className="rounded-lg border border-sky-100 p-4 text-center text-sm font-semibold text-slate-700 hover:bg-cyanSoft"><Stethoscope className="mx-auto mb-2 text-medical" size={22} />{item}</Link>)}
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-navy">Захиалсан цагууд</h2>
            <div className="mt-4 rounded-lg border border-sky-100 bg-cyanSoft p-4">
              <p className="font-semibold text-navy">{doctors[0].name} · {doctors[0].specialty}</p>
              <p className="mt-1 text-sm text-slate-600">2026-05-10 · 11:30 · Баталгаажсан</p>
            </div>
          </section>
          <section className="rounded-lg bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-navy">Шинжилгээ</h2>
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-100 p-4 text-slate-600"><TestTube2 className="text-medical" /> CBC-2026-001 хариу бэлэн</div>
          </section>
        </div>

        <section className="mt-8 rounded-lg bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-navy">Урьдчилан сэргийлэх багц шинжилгээнүүд</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {["Ерөнхий эрүүл мэнд", "Зүрх судасны багц", "Дархлаа, витамин"].map((item) => <div key={item} className="rounded-lg border border-sky-100 p-5"><Sparkles className="text-medical" /><p className="mt-3 font-bold text-navy">{item}</p><p className="mt-2 text-sm text-slate-600">Эмчийн зөвлөмжтэй багц шинжилгээ</p></div>)}
          </div>
        </section>
      </main>
    </div>
  );
}

