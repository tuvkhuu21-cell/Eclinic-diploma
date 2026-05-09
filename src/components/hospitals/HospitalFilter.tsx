import { Building2, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

export function HospitalFilter() {
  return <div className="grid gap-3 rounded-lg border border-slate-100 bg-white p-4 shadow-soft md:grid-cols-2"><label className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><Input className="pl-10" placeholder="Эмнэлгийн нэрээр хайх" /></label><label className="relative"><Building2 className="absolute left-3 top-3 text-slate-400" size={18} /><Input className="pl-10" placeholder="Дүүрэг, үйлчилгээ" /></label></div>;
}

