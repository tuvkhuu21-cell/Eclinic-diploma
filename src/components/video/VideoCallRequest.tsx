import { Video } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function VideoCallRequest() {
  return <div className="rounded-lg border border-sky-100 bg-cyanSoft p-4"><p className="font-bold text-navy">Видео зөвлөгөө эхлүүлэх үү?</p><Button className="mt-3"><Video size={17} className="mr-2" />Хүсэлт илгээх</Button></div>;
}

