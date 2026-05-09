import { HospitalCard } from "@/components/hospitals/HospitalCard";
import { HospitalFilter } from "@/components/hospitals/HospitalFilter";
import { hospitals } from "@/lib/constants";

export default function HospitalsPage() {
  return <section className="mx-auto max-w-7xl px-4 py-10"><h1 className="text-3xl font-bold text-navy">Эмнэлгүүд</h1><p className="mt-2 text-slate-600">Баталгаажсан эмнэлгүүдийг дүүрэг, тасаг, үйлчилгээгээр харна.</p><div className="mt-6"><HospitalFilter /></div><div className="mt-6 grid gap-5 md:grid-cols-3">{hospitals.map((hospital) => <HospitalCard key={hospital.id} hospital={hospital} />)}</div></section>;
}

