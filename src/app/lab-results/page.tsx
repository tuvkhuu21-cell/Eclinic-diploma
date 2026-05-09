import { FileSearch } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LabResultsPage() {
  return <section className="mx-auto max-w-4xl px-4 py-10"><Card className="p-6"><div className="flex items-center gap-3"><FileSearch className="text-medical" size={30} /><h1 className="text-3xl font-bold text-navy">Шинжилгээний хариу авах</h1></div><p className="mt-3 text-slate-600">Лабораторийн код, регистрийн баталгаажуулалтаар хариугаа шалгана.</p><div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]"><Input placeholder="Хариуны код оруулах" /><Button>Шалгах</Button></div><div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">Жишээ: CBC-2026-001 · Хариу бэлэн · AI туслах тайлбарлаж өгөх боломжтой.</div></Card></section>;
}

