import { Badge } from "@/components/ui/Badge";

export function DoctorOnlineStatus({ online = true }: { online?: boolean }) {
  return <Badge className={online ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}><span className={`mr-2 inline-block h-2 w-2 rounded-full ${online ? "bg-emerald-500" : "bg-slate-400"}`} />{online ? "Эмч Active" : "Эмч Offline"}</Badge>;
}
