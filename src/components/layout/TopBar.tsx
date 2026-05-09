import { Phone, Mail, ShieldCheck } from "lucide-react";

export function TopBar() {
  return (
    <div className="bg-navy text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs">
        <div className="flex items-center gap-4"><span className="inline-flex items-center gap-2"><Phone size={14} /> 1800-2026</span><span className="inline-flex items-center gap-2"><Mail size={14} /> support@mediconnect.mn</span></div>
        <span className="inline-flex items-center gap-2 text-cyan-100"><ShieldCheck size={14} /> Баталгаатай эмч, эмнэлгийн нэгдсэн платформ</span>
      </div>
    </div>
  );
}

