"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const options = [
  { label: "Онлайн зөвлөгөө авах", href: "/patient/home/search/doctor" },
  { label: "Эмнэлэгт үзүүлэх", href: "/patient/home/search/hospital?type=private" },
  { label: "Улсын эмнэлэгт үзүүлэх", href: "/patient/home/state-hospital-appointment" },
];

export function AppointmentFlowModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/70 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-navy">Цаг захиалах</h2>
          <button type="button" aria-label="Close appointment options" className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="mt-6 grid gap-3">
          {options.map((option) => (
            <Button
              key={option.href}
              className="h-12 justify-start bg-medical px-5 text-left hover:bg-sky-600"
              onClick={() => {
                onClose();
                router.push(option.href);
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
