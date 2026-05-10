import { CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function AppointmentCard({ title = "Эмчийн цаг захиалга", status = "Баталгаажсан" }: { title?: string; status?: string }) {
  return <Card className="flex items-center justify-between gap-4 p-4"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-lg bg-cyanSoft text-medical"><CalendarClock size={20} /></div><div><h3 className="font-bold text-navy">{title}</h3><p className="text-sm text-slate-500">2026-05-10 · 11:30</p></div></div><Badge>{status}</Badge></Card>;
}
