"use client";

import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AiToolResultCard } from "./AiToolResultCard";

export function AiChatPanel() {
  return (
    <div className="w-[360px] overflow-hidden rounded-lg bg-white shadow-soft">
      <div className="flex items-center gap-2 bg-navy p-4 text-white"><Bot size={20} /><div><h3 className="font-bold">Medi AI туслах</h3><p className="text-xs text-cyan-100">Role-aware agent tools</p></div></div>
      <div className="grid max-h-96 gap-3 overflow-auto p-4 text-sm">
        <p className="rounded-lg bg-slate-100 p-3 text-slate-700">Шинж тэмдэг, цаг захиалга, лабораторийн хариу, эмч хайлт дээр тусална. Таны эрхийн түвшинд тохирсон мэдээлэл л ашиглана.</p>
        <AiToolResultCard title="recommendDoctorBySymptom" result="Цээж өвдөх үед зүрх судасны эмч санал болгож, яаралтай шинж илэрвэл эмнэлэгт хандахыг анхааруулна." />
        <AiToolResultCard title="helpFillAppointmentForm" result="Өвчтөний зовиур, хүссэн огноо, үйлчилгээний төрлөөр цагийн маягт урьдчилан бөглөнө." />
      </div>
      <div className="flex gap-2 border-t p-3"><Input placeholder="AI туслахаас асуух" /><Button className="w-11 px-0" aria-label="Илгээх"><Send size={17} /></Button></div>
    </div>
  );
}

