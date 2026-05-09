import { Mic, PhoneOff, Video } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function VideoCallRoom({ roomId }: { roomId: string }) {
  return <div className="rounded-lg bg-navy p-4 text-white shadow-soft"><div className="grid min-h-[520px] place-items-center rounded-lg bg-slate-900"><div className="text-center"><Video size={56} className="mx-auto text-medical" /><h1 className="mt-4 text-2xl font-bold">Видео өрөө: {roomId}</h1><p className="mt-2 text-slate-300">WebRTC холболтын UI загвар. Socket.IO нь хүсэлт, төлөвийн мэдэгдэл дамжуулна.</p></div></div><div className="mt-4 flex justify-center gap-3"><Button variant="outline"><Mic size={18} /></Button><Button variant="outline"><Video size={18} /></Button><Button className="bg-rose-600 hover:bg-rose-700"><PhoneOff size={18} /></Button></div></div>;
}

