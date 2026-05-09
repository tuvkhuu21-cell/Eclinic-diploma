import Link from "next/link";
import { Building2, Star } from "lucide-react";
import { hospitals } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export type Hospital = (typeof hospitals)[number];

export function HospitalCard({ hospital }: { hospital: Hospital }) {
  return (
    <Card className="overflow-hidden">
      <div className="h-28 bg-gradient-to-br from-sky-100 to-cyanSoft p-5"><Building2 className="text-medical" size={42} /></div>
      <div className="p-5">
        <h3 className="font-bold text-navy">{hospital.name}</h3>
        <p className="mt-1 text-sm text-slate-600">{hospital.type} · {hospital.district}</p>
        <div className="mt-3 flex items-center justify-between text-sm"><span>{hospital.departments} тасаг</span><span className="inline-flex items-center gap-1 text-amber-600"><Star size={15} fill="currentColor" />{hospital.rating}</span></div>
        <Link href={`/hospitals/${hospital.id}`}><Button variant="outline" className="mt-4 w-full">Дэлгэрэнгүй</Button></Link>
      </div>
    </Card>
  );
}

