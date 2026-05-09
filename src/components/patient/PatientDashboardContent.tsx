"use client";

import { useState } from "react";
import { FileX2 } from "lucide-react";
import { PatientSidebar, type PatientSection } from "./PatientSidebar";
import { PatientProfileForm } from "./PatientProfileForm";
import { PatientHealthForm } from "./PatientHealthForm";
import { PatientLifestyleForm } from "./PatientLifestyleForm";

export function PatientDashboardContent() {
  const [section, setSection] = useState<PatientSection>("labs");
  return (
    <section className="bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-[28px] bg-gradient-to-r from-sky-600 to-medical px-6 py-5 text-white shadow-soft">
          <h1 className="text-2xl font-bold">Өвчтөний хувийн кабинет</h1>
          <p className="mt-1 text-sm text-cyan-50">Эрүүл мэндийн мэдээлэл, шинжилгээ, цаг захиалга нэг дор.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <PatientSidebar active={section} onSelect={setSection} />
          <main>
            {section === "personal" && <PatientProfileForm />}
            {section === "health" && <PatientHealthForm />}
            {section === "lifestyle" && <PatientLifestyleForm />}
            {section === "labs" && <LabEmptyState />}
          </main>
        </div>
      </div>
    </section>
  );
}

function LabEmptyState() {
  const tabs = ["Лаборатори", "Хувийн эмнэлэг", "Улсын эмнэлэг"];
  return (
    <div className="rounded-lg bg-white p-6 shadow-soft">
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
        {tabs.map((tab, index) => <button key={tab} className={`rounded-full px-4 py-2 text-sm font-semibold ${index === 0 ? "bg-medical text-white" : "bg-slate-100 text-slate-600"}`}>{tab}</button>)}
      </div>
      <div className="grid min-h-96 place-items-center text-center">
        <div>
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-cyanSoft text-medical"><FileX2 size={38} /></div>
          <p className="mt-5 text-lg font-bold text-navy">Танд шинжилгээний хариу байхгүй байна.</p>
        </div>
      </div>
    </div>
  );
}

