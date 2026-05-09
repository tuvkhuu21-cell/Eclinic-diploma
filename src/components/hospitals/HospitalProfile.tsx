import { hospitals } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { HospitalMap } from "./HospitalMap";

export function HospitalProfile({ id }: { id: string }) {
  const hospital = hospitals.find((item) => item.id === id) || hospitals[0];
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <Card className="p-6"><h1 className="text-3xl font-bold text-navy">{hospital.name}</h1><p className="mt-2 text-slate-600">{hospital.type} · {hospital.district} дүүрэг</p><div className="mt-6 grid gap-4 md:grid-cols-3"><Info title="Тасаг" value={`${hospital.departments}`} /><Info title="Үнэлгээ" value={`${hospital.rating}`} /><Info title="Цахим цаг" value="Идэвхтэй" /></div><h2 className="mt-8 text-xl font-bold text-navy">Үйлчилгээ</h2><p className="mt-3 leading-7 text-slate-600">Оношилгоо, амбулаторийн үзлэг, онлайн зөвлөгөө, лабораторийн хариу шалгах үйлчилгээг MediConnect платформоор дамжуулан нэгтгэн үзүүлнэ.</p></Card>
      <Card className="p-4"><HospitalMap lat={hospital.lat} lng={hospital.lng} name={hospital.name} /><p className="mt-4 text-sm text-slate-600">Байршлын координат дээр Google Map marker харуулна. Чиглэл авах товч оруулаагүй.</p></Card>
    </div>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-400">{title}</p><p className="mt-1 font-bold text-navy">{value}</p></div>;
}

