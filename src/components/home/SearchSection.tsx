import { Building2, Search, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function SearchSection() {
  return (
    <section className="mx-auto -mt-7 max-w-7xl px-4">
      <Card className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto]">
        <label className="relative"><Stethoscope className="absolute left-3 top-3 text-medical" size={18} /><Input className="pl-10" placeholder="Эмчийн нэр, мэргэжлээр хайх" /></label>
        <label className="relative"><Building2 className="absolute left-3 top-3 text-medical" size={18} /><Input className="pl-10" placeholder="Эмнэлэг, дүүргээр хайх" /></label>
        <Button className="h-11"><Search size={18} className="mr-2" />Хайх</Button>
      </Card>
    </section>
  );
}

