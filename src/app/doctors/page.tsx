import { DoctorCard } from "@/components/doctors/DoctorCard";
import { DoctorFilter } from "@/components/doctors/DoctorFilter";
import { doctors } from "@/lib/constants";

export default function DoctorsPage() {
  return <section className="mx-auto max-w-7xl px-4 py-10"><h1 className="text-3xl font-bold text-navy">Эмч нар</h1><p className="mt-2 text-slate-600">Мэргэжил, эмнэлэг, онлайн төлөвөөр хайж цаг захиална.</p><div className="mt-6"><DoctorFilter /></div><div className="mt-6 grid gap-5 md:grid-cols-2">{doctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}</div></section>;
}

