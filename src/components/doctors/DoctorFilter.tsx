import { Search } from "lucide-react";
import { specialties } from "@/lib/constants";
import { Input } from "@/components/ui/Input";

export function DoctorFilter() {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-soft">
      <div className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><Input className="pl-10" placeholder="Эмчийн нэрээр хайх" /></div>
      <div className="mt-4 flex flex-wrap gap-2">{specialties.map((item) => <button key={item} className="rounded-full border border-sky-100 px-3 py-1 text-sm text-slate-600 hover:bg-cyanSoft">{item}</button>)}</div>
    </div>
  );
}

