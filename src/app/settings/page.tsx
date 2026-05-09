import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  return <section className="mx-auto max-w-3xl px-4 py-10"><Card className="p-6"><h1 className="text-3xl font-bold text-navy">Тохиргоо</h1><div className="mt-6 grid gap-4"><Input placeholder="Нэр" /><Input placeholder="Утас" /><Input placeholder="Мэдэгдлийн имэйл" /><Button>Хадгалах</Button></div></Card></section>;
}

