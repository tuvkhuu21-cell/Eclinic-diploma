"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Baby,
  Bone,
  Brain,
  Check,
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
import { appointmentSpecialties } from "@/components/appointments/specialtyOptions";
import { cn } from "@/lib/utils";

export const consultationSpecialties = ["Бүгд", ...appointmentSpecialties];

const icons: LucideIcon[] = [Stethoscope, ShieldPlus, Pill, Bone, Sparkles, HeartPulse, Brain, Syringe, Microscope, Baby];

export function ImmediateConsultationSelector({ selected, onSelect, compact = false }: { selected: string; onSelect: (specialty: string) => void; compact?: boolean }) {
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const visibleSpecialties = useMemo(() => (
    consultationSpecialties.filter((specialty) => specialty.toLowerCase().includes(query.toLowerCase()))
  ), [query]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const currentList = list;

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      event.stopPropagation();
      currentList.scrollTop += event.deltaY;
    }

    currentList.addEventListener("wheel", handleWheel, { passive: false });
    return () => currentList.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div>
      <p className="text-sm font-semibold text-slate-600">Үзлэгийн төрлөө сонгоно уу.</p>
      <div className="mt-4 flex items-center rounded-xl border border-sky-100 bg-white px-4 py-3">
        <Search size={18} className="text-medical" />
        <input className="ml-3 w-full text-sm outline-none" placeholder="Хайх..." value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div
        ref={listRef}
        className={cn(
          "group/list mt-4 max-h-[48vh] overflow-y-auto overscroll-contain pr-2 [scrollbar-color:transparent_transparent] [scrollbar-width:thin] hover:[scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-300",
          compact ? "grid gap-2" : "grid gap-3",
        )}
      >
        {visibleSpecialties.map((specialty, index) => {
          const Icon = icons[index % icons.length];
          const isSelected = selected === specialty;
          return (
            <button
              key={specialty}
              type="button"
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-white p-3 text-left transition hover:border-medical hover:bg-cyanSoft",
                isSelected ? "border-medical ring-2 ring-sky-100" : "border-sky-100",
              )}
              onClick={() => onSelect(specialty)}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cyanSoft text-medical">
                <Icon size={22} />
              </span>
              <span className="min-w-0 flex-1 text-sm font-bold text-medical">{specialty}</span>
              {isSelected && <span className="grid h-6 w-6 place-items-center rounded-full bg-medical text-white"><Check size={15} /></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
