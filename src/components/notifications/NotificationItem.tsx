import { Bell } from "lucide-react";

export function NotificationItem({ text, time }: { text: string; time: string }) {
  return <div className="flex gap-3 rounded-lg border border-slate-100 bg-white p-4"><div className="grid h-10 w-10 place-items-center rounded-lg bg-cyanSoft text-medical"><Bell size={18} /></div><div><p className="font-semibold text-navy">{text}</p><p className="text-sm text-slate-500">{time}</p></div></div>;
}

