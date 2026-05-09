import { CheckCircle2 } from "lucide-react";

export function AiToolResultCard({ title, result }: { title: string; result: string }) {
  return <div className="rounded-lg border border-sky-100 bg-cyanSoft p-3 text-sm"><p className="flex items-center gap-2 font-bold text-navy"><CheckCircle2 size={16} />{title}</p><p className="mt-1 text-slate-600">{result}</p></div>;
}

