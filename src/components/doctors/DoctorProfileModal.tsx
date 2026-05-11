"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, GraduationCap, Star, Video, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Doctor } from "./DoctorCard";

const educationItems = [
  { years: "1987 - 1994", degree: "Хүний их эмч", school: "АУИС" },
  { years: "1994 - 1996", degree: "Хүүхдийн их эмч", school: "АУИС" },
  { years: "1997 - 1998", degree: "Хүүхдийн их эмч", school: "АУИС" },
];

const reviews = [
  { name: "Э. ӨЛЗИЙБУЯН", rating: 5, text: "маш ойлгомжтой зөвлөгөө өгсөн" },
  { name: "Б. НЯМЗАВ", rating: 4, text: "харшлын эмч юм байна" },
  { name: "О. Өлзийням", rating: 5, text: "🫶" },
  { name: "О. Өлзийням", rating: 5, text: "🫶" },
  { name: "Э. АЛУНГУА", rating: 5, text: "bayarlala" },
  { name: "Б. ОЮУНТҮЛХҮҮР", rating: 5, text: "🥰" },
  { name: "Т. Эрдэнэцэцэг", rating: 5, text: "хүлээлтийн эмчилгээний зөвлөгөө авлаа. баярлалаа" },
  { name: "Б. УЯНГА", rating: 5, text: "bayarlalaa" },
  { name: "Т. АРИУНАА", rating: 5, text: "bayrlalaa emchdee" },
  { name: "B. batchimeg", rating: 5, text: "" },
];

const DEFAULT_ONLINE_PRICE = 30000;

export function DoctorProfileModal({ doctor, onClose }: { doctor: Doctor | null; onClose: () => void }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"about" | "articles">("about");
  const [scrollHover, setScrollHover] = useState(false);

  useEffect(() => {
    if (!doctor) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [doctor, onClose]);

  if (!doctor) return null;

  const name = `${doctor.user.lastName || ""} ${doctor.user.firstName}`.trim();
  const count = (doctor._count?.appointments || 0) + (doctor._count?.consultations || 0);
  const doctorId = doctor.id;
  const onlinePrice = doctor.fee && doctor.fee > 0 ? doctor.fee : DEFAULT_ONLINE_PRICE;
  const supportsOnline = doctor.supportsOnline ?? doctor.online;
  const supportsInPerson = doctor.supportsInPerson ?? Boolean(doctor.hospital?.name);
  const hospitalName = doctor.hospital?.name || "Эмнэлэг";
  const specialty = doctor.specialty;

  function startOnlineBooking() {
    router.push(`/patient/home/appointment/timetable?service=${doctorId}`);
  }

  function startInstantBooking() {
    router.push(`/patient/home/consultation?specialty=${encodeURIComponent(specialty)}`);
  }

  function startInPersonBooking() {
    const params = new URLSearchParams({
      doctorId,
      hospitalName,
      specialty,
    });
    router.push(`/patient/home/appointment/hospital?${params.toString()}`);
  }

  return (
    <div className="fixed inset-0 z-[90] bg-slate-700/35 px-4 py-6 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="mx-auto flex max-h-[calc(100vh-3rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_26px_90px_rgba(14,165,233,0.22)]" onMouseDown={(event) => event.stopPropagation()}>
        <div className="relative bg-gradient-to-br from-sky-500 via-medical to-cyan-500 px-6 pb-8 pt-5 text-white">
          <button type="button" aria-label="Close doctor profile" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25" onClick={onClose}>
            <X size={19} />
          </button>
          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-end">
            <div className="mb-[-54px] grid h-28 w-28 shrink-0 place-items-center rounded-full border-4 border-white bg-cyanSoft text-3xl font-extrabold text-medical shadow-soft">{name.slice(0, 2)}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-3xl font-bold">{name}</h2>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-medical"><CheckCircle2 size={16} /></span>
              </div>
              <p className="mt-2 text-sm font-semibold text-cyan-50">{doctor.specialty} · {doctor.hospital?.name || "Эмнэлэг сонгоогүй"}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-white/90">
                <span>{doctor.experience} жил туршлага</span>
                <span className="inline-flex items-center gap-1"><Star size={15} fill="currentColor" />{doctor.rating}</span>
                <span>{count} зөвлөгөө</span>
                <span>{formatCurrency(onlinePrice)}₮</span>
                <span className="inline-flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${doctor.online ? "bg-emerald-300" : "bg-slate-300"}`} />{doctor.online ? "Active" : "Offline"}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {supportsOnline && doctor.online && <Button className="h-11 rounded-xl bg-white px-5 text-medical shadow-sm hover:bg-cyanSoft" onClick={startInstantBooking}>Яг одоо зөвлөгөө авах</Button>}
              {supportsOnline && <Button className="h-11 rounded-xl bg-[#073b5c] px-6 text-white shadow-sm hover:bg-[#0b5b86]" onClick={startOnlineBooking}><Video size={17} className="mr-2" />Онлайн</Button>}
              {supportsInPerson && <Button className="h-11 rounded-xl bg-cyanSoft px-6 text-medical shadow-sm hover:bg-white" onClick={startInPersonBooking}><Building2 size={17} className="mr-2" />Биечлэн</Button>}
            </div>
          </div>
        </div>

        <div className="flex border-b border-sky-100 bg-white px-6 pt-8">
          <TabButton active={activeTab === "about"} onClick={() => setActiveTab("about")}>Тухай</TabButton>
          <TabButton active={activeTab === "articles"} onClick={() => setActiveTab("articles")}>Нийтлэл</TabButton>
        </div>

        <div
          className={`modal-scroll flex-1 overflow-y-auto px-6 py-6 ${scrollHover ? "scroll-hover" : ""}`}
          onMouseEnter={() => setScrollHover(true)}
          onMouseLeave={() => setScrollHover(false)}
        >
          {activeTab === "about" ? (
            <div className="grid gap-8">
              <section>
                <h3 className="text-xl font-bold text-navy">Танилцуулга</h3>
                <p className="mt-3 max-w-3xl leading-7 text-slate-600">{doctor.bio || "Эмч товч танилцуулгаа хараахан оруулаагүй байна."}</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-navy">Боловсролын мэдээлэл</h3>
                <div className="mt-4 grid gap-3">
                  {educationItems.map((item) => (
                    <div key={`${item.years}-${item.degree}`} className="flex gap-4 rounded-2xl border border-sky-100 bg-white p-4">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyanSoft text-medical"><GraduationCap size={20} /></div>
                      <div>
                        <p className="text-sm font-bold text-medical">{item.years}</p>
                        <p className="mt-1 font-bold text-navy">{item.degree}</p>
                        <p className="text-sm text-slate-500">{item.school}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <ReviewsSection />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-sky-100 bg-cyanSoft p-6 text-sm font-semibold text-medical">
              Нийтлэл одоогоор нийтлэгдээгүй байна.
            </div>
          )}
        </div>
        <style jsx>{`
          .modal-scroll {
            scrollbar-width: none;
          }
          .modal-scroll::-webkit-scrollbar {
            width: 0;
          }
          .modal-scroll.scroll-hover {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 transparent;
          }
          .modal-scroll.scroll-hover::-webkit-scrollbar {
            width: 6px;
          }
          .modal-scroll.scroll-hover::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 999px;
          }
          .modal-scroll.scroll-hover::-webkit-scrollbar-track {
            background: transparent;
          }
        `}</style>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" className={`border-b-2 px-4 py-4 text-sm font-bold transition ${active ? "border-medical text-medical" : "border-transparent text-slate-500 hover:text-medical"}`} onClick={onClick}>{children}</button>;
}

function ReviewsSection() {
  return (
    <section>
      <h3 className="text-xl font-bold text-navy">Сэтгэгдлүүд</h3>
      <div className="mt-4 grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="rounded-2xl border border-sky-100 bg-cyanSoft p-5">
          <p className="text-sm font-semibold text-slate-600">5-аас:</p>
          <p className="mt-1 text-5xl font-extrabold text-navy">4.9</p>
          <p className="mt-2 text-sm font-semibold text-medical">Нийт 107 үнэлгээ</p>
          <div className="mt-5 grid gap-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span className="w-4">{star}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${star === 5 ? 88 : star === 4 ? 9 : 1}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          {reviews.map((review, index) => (
            <article key={`${review.name}-${index}`} className="rounded-2xl border border-sky-100 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <b className="text-sm text-navy">{review.name}</b>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600"><Star size={15} fill="currentColor" />{review.rating}</span>
              </div>
              {review.text && <p className="mt-2 text-sm text-slate-600">{review.text}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
