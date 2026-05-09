import { hospitals } from "@/lib/constants";
import { HospitalCard } from "@/components/hospitals/HospitalCard";

export function HospitalSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-3xl font-bold text-navy">Итгэмжлэгдсэн эмнэлгүүд</h2>
        <p className="mt-2 text-slate-600">Дүүрэг, үйлчилгээ, тасгаар сонгон цаг авах боломжтой.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">{hospitals.map((hospital) => <HospitalCard key={hospital.id} hospital={hospital} />)}</div>
      </div>
    </section>
  );
}

