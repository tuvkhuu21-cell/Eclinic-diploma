import { MessageCircle, Video } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VideoCallRequest } from "@/components/video/VideoCallRequest";

export default function ConsultationPage() {
  return <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[1fr_380px]"><Card className="p-6"><h1 className="text-3xl font-bold text-navy">Зөвлөгөө авах</h1><p className="mt-3 leading-7 text-slate-600">Онлайн байгаа эмчтэй чатлах, шаардлагатай үед видео зөвлөгөөний хүсэлт илгээх боломжтой. Яаралтай тусламж шаардсан тохиолдолд шууд 103 дуудна уу.</p><div className="mt-6 flex flex-wrap gap-3"><Button><MessageCircle size={17} className="mr-2" />Чат эхлүүлэх</Button><Button variant="secondary"><Video size={17} className="mr-2" />Видео хүсэлт</Button></div></Card><VideoCallRequest /></section>;
}

