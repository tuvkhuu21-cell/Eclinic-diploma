"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { ImmediateConsultationSelector } from "./ImmediateConsultationSelector";

export function ImmediateConsultationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [warning, setWarning] = useState("");

  if (!open) return null;

  function continueToConsultation() {
    if (!selected) {
      setWarning("Үргэлжлүүлэхийн өмнө үзлэгийн төрлөө сонгоно уу.");
      return;
    }
    onClose();
    router.push(selected === "Бүгд" ? "/patient/home/consultation" : `/patient/home/consultation?specialty=${encodeURIComponent(selected)}`);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/70 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-navy">Яг одоо цаг авах</h2>
            <p className="mt-1 text-sm text-slate-600">Үзлэгийн төрлөө сонгоно уу.</p>
          </div>
          <button type="button" aria-label="Close consultation options" className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="mt-5">
          <ImmediateConsultationSelector selected={selected} onSelect={(value) => { setSelected(value); setWarning(""); }} compact />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-rose-600">{warning}</p>
          <button type="button" className="ml-auto rounded-lg bg-medical px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50" disabled={!selected} onClick={continueToConsultation}>
            Үргэлжлүүлэх →
          </button>
        </div>
      </div>
    </div>
  );
}
