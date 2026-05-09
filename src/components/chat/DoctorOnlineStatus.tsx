import { Badge } from "@/components/ui/Badge";

export function DoctorOnlineStatus({ online = true }: { online?: boolean }) {
  return <Badge className={online ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}>{online ? "Эмч онлайн" : "Эмч офлайн"}</Badge>;
}

