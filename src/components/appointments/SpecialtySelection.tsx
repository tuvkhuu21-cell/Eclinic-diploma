"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Baby,
  Bone,
  Brain,
  Check,
  ChevronLeft,
  HeartPulse,
  Microscope,
  Pill,
  Search,
  ShieldPlus,
  Sparkles,
  Stethoscope,
  Syringe,
  type LucideIcon,
} from "lucide-react";
import { appointmentSpecialties } from "./specialtyOptions";
import { cn } from "@/lib/utils";

const icons: LucideIcon[] = [Stethoscope, ShieldPlus, Pill, Bone, Sparkles, HeartPulse, Brain, Syringe, Microscope, Baby];

export function SpecialtySelection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [warning, setWarning] = useState("");

  const visibleSpecialties = useMemo(() => (
    appointmentSpecialties.filter((specialty) => specialty.toLowerCase().includes(query.toLowerCase()))
  ), [query]);

  function continueToDoctors() {
    if (!selected) {
      setWarning("Үргэлжлүүлэхийн өмнө үзлэгийн төрлөө сонгоно уу.");
      return;
    }
    router.push(`/patient/home/search/doctor?specialty=${encodeURIComponent(selected)}`);
  }

  return (
    <section className="bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <button type="button" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-medical hover:text-sky-600" onClick={() => router.back()}>
          <ChevronLeft size={18} />
          Буцах
        </button>
        <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-soft">
          <h1 className="text-3xl font-bold text-navy">Цаг захиалга</h1>
          <p className="mt-2 text-slate-600">Үзлэгийн төрлөө сонгоно уу.</p>

          <div className="mt-6 flex items-center rounded-xl border border-sky-100 bg-white px-4 py-3">
            <Search size={18} className="text-medical" />
            <input className="ml-3 w-full text-sm outline-none" placeholder="Үзлэгийн төрөл хайх" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>

          <div className="group/specialties mt-6 max-h-[58vh] overflow-y-auto overscroll-contain pr-2 [scrollbar-color:transparent_transparent] [scrollbar-width:thin] hover:[scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {visibleSpecialties.map((specialty, index) => {
              const Icon = icons[index % icons.length];
              const isSelected = selected === specialty;
              return (
                <button
                  key={specialty}
                  type="button"
                  className={cn(
                    "relative rounded-2xl border bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-soft",
                    isSelected ? "border-medical ring-4 ring-sky-100" : "border-sky-100",
                  )}
                  onClick={() => {
                    setSelected(specialty);
                    setWarning("");
                  }}
                >
                  {isSelected && <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-medical text-white"><Check size={15} /></span>}
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-cyanSoft text-medical">
                    <Icon size={30} />
                  </div>
                  <p className="mt-4 text-sm font-bold leading-5 text-medical">{specialty}</p>
                </button>
              );
            })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-rose-600">{warning}</p>
            <button type="button" className="ml-auto rounded-lg bg-medical px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50" disabled={!selected} onClick={continueToDoctors}>
              Үргэлжлүүлэх →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
