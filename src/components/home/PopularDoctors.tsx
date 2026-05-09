import { doctors } from "@/lib/constants";
import { DoctorCard } from "@/components/doctors/DoctorCard";

export function PopularDoctors() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-end justify-between"><div><h2 className="text-3xl font-bold text-navy">Эрэлттэй эмч нар</h2><p className="mt-2 text-slate-600">Үнэлгээ өндөр, онлайн зөвлөгөө өгөх боломжтой эмчүүд.</p></div></div>
      <div className="grid gap-5 md:grid-cols-2">{doctors.slice(0, 4).map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}</div>
    </section>
  );
}

