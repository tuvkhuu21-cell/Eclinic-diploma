"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Paperclip, PhoneOff, Send, Video, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MessageBubble } from "./MessageBubble";
import { DoctorOnlineStatus } from "./DoctorOnlineStatus";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";

type ChatRoom = {
  id: string;
  patient: { user: { firstName: string; lastName?: string } };
  doctor: { id: string; user: { firstName: string; lastName?: string }; specialty: string; online?: boolean };
  appointment?: {
    id: string;
    type?: string;
    scheduledAt: string;
    durationMinutes?: number;
    videoCall?: { roomId: string; status?: string } | null;
  } | null;
};

type ChatMessage = {
  id: string;
  content: string;
  senderId: string;
};

export function ChatBox() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let firstLoad = true;
    let cancelled = false;
    async function loadRooms() {
      try {
        const response = await api.get("/chat/rooms");
        if (cancelled) return;
        const rows = response.data.data as ChatRoom[];
        setRooms(rows);
        if (firstLoad) {
          const requestedRoom = new URLSearchParams(window.location.search).get("roomId");
          setActiveRoomId(requestedRoom || rows[0]?.id || "");
          firstLoad = false;
        }
      } catch {
        if (!cancelled) setRooms([]);
      }
    }
    loadRooms();
    const timer = window.setInterval(loadRooms, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!activeRoomId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    async function loadMessages() {
      try {
        const response = await api.get(`/chat/rooms/${activeRoomId}/messages`);
        if (!cancelled) setMessages(response.data.data as ChatMessage[]);
      } catch {
        if (!cancelled) setMessages([]);
      }
    }

    loadMessages();
    const timer = window.setInterval(loadMessages, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activeRoomId]);

  const activeRoom = useMemo(() => rooms.find((room) => room.id === activeRoomId), [activeRoomId, rooms]);
  const activeOnlineAppointment = activeRoom?.appointment?.type === "ONLINE" || (activeRoom?.appointment && !activeRoom.appointment.type);

  async function sendMessage() {
    const content = draft.trim();
    if (!activeRoomId || !content || sending) return;
    setSending(true);
    try {
      const response = await api.post("/chat/messages", { roomId: activeRoomId, content });
      setMessages((current) => [...current, response.data.data as ChatMessage]);
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  async function sendAttachment(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!activeRoomId || !file || sending || uploading) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const uploadResponse = await api.post("/chat/upload", data, { headers: { "Content-Type": "multipart/form-data" } });
      const attachment = uploadResponse.data.data as { url: string; name: string; mimeType: string; size: number };
      const payload = JSON.stringify({ text: draft.trim(), attachment });
      const response = await api.post("/chat/messages", { roomId: activeRoomId, content: payload });
      setMessages((current) => [...current, response.data.data as ChatMessage]);
      setDraft("");
    } finally {
      setUploading(false);
    }
  }

  async function openVideoCall() {
    if (!activeRoom?.appointment) return;
    const existingRoomId = activeRoom.appointment.videoCall?.roomId;
    const existingStatus = activeRoom.appointment.videoCall?.status;
    if (existingRoomId && existingStatus !== "ended" && existingStatus !== "declined") {
      await api.patch("/video-calls", { roomId: existingRoomId, status: "ringing" }).catch(() => null);
      router.push(`/video-call/${existingRoomId}?start=1`);
      return;
    }
    try {
      const response = await api.post("/video-calls", { doctorId: activeRoom.doctor.id, appointmentId: activeRoom.appointment.id });
      const roomId = response.data.data.roomId as string;
      console.log("video-call: chat open", { roomId, appointmentId: activeRoom.appointment.id, doctorId: activeRoom.doctor.id });
      await api.patch("/video-calls", { roomId, status: "ringing" }).catch(() => null);
      setRooms((current) => current.map((room) => room.id === activeRoom.id ? { ...room, appointment: room.appointment ? { ...room.appointment, videoCall: { roomId, status: "ringing" } } : room.appointment } : room));
      router.push(`/video-call/${roomId}?start=1`);
    } catch {
      window.alert("Видео өрөө үүсгэхэд алдаа гарлаа.");
    }
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-soft">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Эмчтэй чатлах</h1>
          <p className="mt-1 text-sm text-slate-500">Зурвасууд 5 секунд тутам шинэчлэгдэнэ.</p>
        </div>
        <DoctorOnlineStatus online={activeRoom?.doctor.online} />
      </div>
      <div className="grid min-h-[520px] lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-slate-100 bg-slate-50 p-3 lg:border-b-0 lg:border-r">
          <div className="grid gap-2">
            {rooms.map((room) => {
              const doctorName = `${room.doctor.user.lastName || ""} ${room.doctor.user.firstName}`.trim();
              const patientName = `${room.patient.user.lastName || ""} ${room.patient.user.firstName}`.trim();
              const title = user?.role === "DOCTOR" ? patientName : doctorName;
              return (
                <button key={room.id} type="button" className={`rounded-xl px-3 py-3 text-left transition ${activeRoomId === room.id ? "bg-cyanSoft text-medical" : "bg-white text-slate-700 hover:bg-cyanSoft"}`} onClick={() => setActiveRoomId(room.id)}>
                  <p className="font-bold">{title}</p>
                  <p className="mt-1 text-xs text-slate-500">{room.doctor.specialty}</p>
                </button>
              );
            })}
            {rooms.length === 0 && <p className="rounded-xl bg-white p-4 text-sm font-semibold text-slate-500">Чат өрөө одоогоор алга.</p>}
          </div>
        </aside>
        <main className="flex min-h-[520px] flex-col">
          <div className="border-b p-4">
            <h2 className="font-bold text-navy">{activeRoom ? (user?.role === "DOCTOR" ? `${activeRoom.patient.user.lastName || ""} ${activeRoom.patient.user.firstName}`.trim() : `${activeRoom.doctor.user.lastName || ""} ${activeRoom.doctor.user.firstName}`.trim()) : "Чат сонгоно уу"}</h2>
            {activeRoom?.appointment && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                <span className="rounded-full bg-cyanSoft px-3 py-1 text-medical">Онлайн зөвлөгөө</span>
                <span>{formatDateTime(activeRoom.appointment.scheduledAt)}</span>
                {activeOnlineAppointment && (
          <button type="button" title="Видео дуудлага" aria-label="Видео дуудлага" className="grid h-8 w-8 place-items-center rounded-full bg-medical text-white transition hover:bg-sky-600" onClick={openVideoCall}>
                    <Video size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="grid flex-1 content-end gap-3 overflow-y-auto p-4">
            {messages.map((message) => <MessageBubble key={message.id} mine={message.senderId === user?.id} text={message.content} />)}
            {activeRoom && messages.length === 0 && <p className="rounded-xl bg-cyanSoft p-4 text-sm font-semibold text-medical">Энэ чатад зурвас алга. Эхний зурвасаа илгээнэ үү.</p>}
          </div>
          <div className="flex gap-2 border-t p-4">
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={sendAttachment} />
            <Button variant="outline" className="w-12 px-0" aria-label="Файл хавсаргах" disabled={!activeRoomId || uploading} onClick={() => fileInputRef.current?.click()}><Paperclip size={18} /></Button>
            <Input placeholder="Зурвас бичих" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendMessage(); }} disabled={!activeRoomId} />
            <Button className="w-12 px-0" aria-label="Илгээх" disabled={!activeRoomId || sending || uploading} onClick={sendMessage}><Send size={18} /></Button>
          </div>
        </main>
      </div>
      <IncomingCallPopup rooms={rooms} onAccept={(roomId) => router.push(`/video-call/${roomId}?accept=1`)} onDecline={async (roomId) => { await api.patch("/video-calls", { roomId, status: "declined" }).catch(() => null); setRooms((current) => current.map((room) => room.appointment?.videoCall?.roomId === roomId && room.appointment.videoCall ? { ...room, appointment: { ...room.appointment, videoCall: { ...room.appointment.videoCall, status: "declined" } } } : room)); }} />
    </div>
  );
}

function IncomingCallPopup({ rooms, onAccept, onDecline }: { rooms: ChatRoom[]; onAccept: (roomId: string) => void; onDecline: (roomId: string) => void }) {
  const user = useAuthStore((state) => state.user);
  const ringingRoom = rooms.find((room) => room.appointment?.videoCall?.status === "ringing" && room.appointment.videoCall.roomId);
  if (!ringingRoom?.appointment?.videoCall?.roomId) return null;
  const callerName = user?.role === "DOCTOR"
    ? `${ringingRoom.patient.user.lastName || ""} ${ringingRoom.patient.user.firstName}`.trim()
    : `${ringingRoom.doctor.user.lastName || ""} ${ringingRoom.doctor.user.firstName}`.trim();
  const roomId = ringingRoom.appointment.videoCall.roomId;
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 text-center shadow-[0_24px_80px_rgba(14,116,144,0.25)]">
        <button type="button" className="ml-auto grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100" onClick={() => onDecline(roomId)} aria-label="Close incoming call"><X size={17} /></button>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-cyanSoft text-medical"><Video size={28} /></div>
        <h2 className="mt-4 text-xl font-extrabold text-navy">Видео дуудлага ирлээ</h2>
        <p className="mt-2 text-sm font-semibold text-slate-600">{callerName || "MediConnect хэрэглэгч"}</p>
        <div className="mt-5 flex justify-center gap-3">
          <button type="button" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700" onClick={() => onAccept(roomId)}>
            <Video size={16} /> Accept
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-bold text-white hover:bg-rose-700" onClick={() => onDecline(roomId)}>
            <PhoneOff size={16} /> Decline
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}
