import { Bot, CalendarPlus, FileText, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";

const features = [
  { title: "Эмч, эмнэлгийн цаг захиалах", text: "Өөрт ойр эмнэлэг, тохиромжтой цагийг сонгон баталгаажуулна.", icon: CalendarPlus },
  { title: "Яг одоо зөвлөгөө авах", text: "Онлайн байгаа эмчтэй чат болон видео хүсэлтээр холбогдоно.", icon: MessageCircle },
  { title: "Шинжилгээний хариу авах", text: "Код эсвэл бүртгэлээрээ лабораторийн хариугаа шалгана.", icon: FileText },
  { title: "AI туслах", text: "Шинж тэмдэг тайлбарлаж, зөв эмч санал болгож, маягт бөглөхөд тусална.", icon: Bot },
];

export function FeatureCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="grid gap-5 md:grid-cols-4">
        {features.map(({ title, text, icon: Icon }) => (
          <Card key={title} className="p-6">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-lg bg-cyanSoft text-medical"><Icon size={24} /></div>
            <h3 className="text-lg font-bold text-navy">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

