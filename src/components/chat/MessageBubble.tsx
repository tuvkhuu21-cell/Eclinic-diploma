import { cn } from "@/lib/utils";

export function MessageBubble({ mine, text }: { mine?: boolean; text: string }) {
  return <div className={cn("max-w-[75%] rounded-lg p-3 text-sm", mine ? "ml-auto bg-medical text-white" : "bg-slate-100 text-slate-700")}>{text}</div>;
}

