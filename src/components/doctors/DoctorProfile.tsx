import { CalendarPlus, GraduationCap, Star } from "lucide-react";
import { doctors } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function DoctorProfile({ id }: { id: string }) {
  const doctor = doctors.find((item) => item.id === id) || doctors[0];
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="p-6">
        <div className="flex flex-wrap gap-5">
          <div className="grid h-24 w-24 place-items-center rounded-lg bg-sky-100 text-3xl font-bold text-medical">{doctor.name.slice(0, 2)}</div>
          <div><h1 className="text-3xl font-bold text-navy">{doctor.name}</h1><p className="mt-1 text-slate-600">{doctor.specialty} · {doctor.hospital}</p><p className="mt-3 inline-flex items-center gap-1 font-semibold text-amber-600"><Star size={18} fill="currentColor" /> {doctor.rating} үнэлгээ</p></div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3"><Info title="Туршлага" value={doctor.experience} /><Info title="Зөвлөгөөний төлбөр" value={doctor.fee} /><Info title="Төлөв" value={doctor.online ? "Онлайн" : "Офлайн"} /></div>
        <h2 className="mt-8 text-xl font-bold text-navy">Танилцуулга</h2>
        <p className="mt-3 leading-7 text-slate-600">Өвчтөн төвтэй оношилгоо, цахим зөвлөгөө, давтан хяналтад төвлөрсөн туршлагатай эмч. MediConnect дээр цагийн хуваарь, онлайн зөвлөгөө, бичиг баримтын түүхийг нэг дор удирдана.</p>
      </Card>
      <Card className="p-6"><h2 className="text-xl font-bold text-navy">Цаг захиалах</h2><div className="mt-4 grid gap-3">{["09:00", "11:30", "14:00", "16:30"].map((time) => <button key={time} className="rounded-lg border border-sky-100 p-3 text-left font-semibold hover:bg-cyanSoft">{time} · Өнөөдөр</button>)}</div><Button className="mt-5 w-full"><CalendarPlus size={17} className="mr-2" />Цаг сонгох</Button><p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><GraduationCap size={16} />Зөвхөн баталгаажсан эмчийн профайл.</p></Card>
    </div>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-400">{title}</p><p className="mt-1 font-bold text-navy">{value}</p></div>;
}

