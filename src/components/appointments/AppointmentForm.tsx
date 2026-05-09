"use client";

import { CalendarDays, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export function AppointmentForm() {
  return <Card className="p-6"><h1 className="text-2xl font-bold text-navy">Цаг захиалах</h1><div className="mt-5 grid gap-4 md:grid-cols-2"><Input placeholder="Өвчтөний нэр" /><Input placeholder="Утас" /><Input placeholder="Эмч эсвэл эмнэлэг" /><Input type="datetime-local" /><textarea className="min-h-28 rounded-lg border border-slate-200 p-4 outline-none focus:border-medical md:col-span-2" placeholder="Шинж тэмдэг, нэмэлт мэдээлэл" /></div><Button className="mt-5"><Send size={17} className="mr-2" />Хүсэлт илгээх</Button><p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><CalendarDays size={16} />Илгээсний дараа мэдэгдлээр баталгаажилт ирнэ.</p></Card>;
}

