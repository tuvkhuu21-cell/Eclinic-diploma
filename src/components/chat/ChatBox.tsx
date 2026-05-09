"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MessageBubble } from "./MessageBubble";
import { DoctorOnlineStatus } from "./DoctorOnlineStatus";

export function ChatBox() {
  return <div className="rounded-lg bg-white shadow-soft"><div className="flex items-center justify-between border-b p-4"><h1 className="text-xl font-bold text-navy">Эмчтэй чатлах</h1><DoctorOnlineStatus /></div><div className="grid min-h-96 content-end gap-3 p-4"><MessageBubble text="Сайн байна уу, ямар зовиур илэрч байна вэ?" /><MessageBubble mine text="Цээжээр үе үе өвдөөд байна." /><MessageBubble text="Зүрх судасны эмчид цаг авч, даралт болон ЭКГ шинжилгээг хавсаргаарай." /></div><div className="flex gap-2 border-t p-4"><Input placeholder="Зурвас бичих" /><Button className="w-12 px-0" aria-label="Илгээх"><Send size={18} /></Button></div></div>;
}

