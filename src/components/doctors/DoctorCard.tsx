import Link from "next/link";
import { Star, Video } from "lucide-react";
import { doctors } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export type Doctor = (typeof doctors)[number];

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Card className="p-5">
      <div className="flex gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-sky-100 text-xl font-bold text-medical">{doctor.name.slice(0, 2)}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-navy">{doctor.name}</h3><p className="text-sm text-slate-600">{doctor.specialty}</p></div><Badge className={doctor.online ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}>{doctor.online ? "Онлайн" : "Офлайн"}</Badge></div>
          <p className="mt-2 text-sm text-slate-500">{doctor.hospital} · {doctor.experience}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600"><Star size={16} fill="currentColor" />{doctor.rating} · {doctor.fee}</span>
            <Link href={`/doctors/${doctor.id}`}><Button variant="outline" className="h-9 px-3"><Video size={15} className="mr-2" />Профайл</Button></Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

