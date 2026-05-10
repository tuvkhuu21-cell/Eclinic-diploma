"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MessageBubble } from "./MessageBubble";
import { DoctorOnlineStatus } from "./DoctorOnlineStatus";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";

type ChatRoom = {
  id: string;
  patient: { user: { firstName: string; lastName?: string } };
  doctor: { user: { firstName: string; lastName?: string }; specialty: string };
};

type ChatMessage = {
  id: string;
  content: string;
  senderId: string;
};

export function ChatBox() {
  const user = useAuthStore((state) => state.user);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get("/chat/rooms").then((response) => {
      const rows = response.data.data as ChatRoom[];
      setRooms(rows);
      const requestedRoom = new URLSearchParams(window.location.search).get("roomId");
      setActiveRoomId(requestedRoom || rows[0]?.id || "");
    }).catch(() => setRooms([]));
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

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-soft">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Эмчтэй чатлах</h1>
          <p className="mt-1 text-sm text-slate-500">Зурвасууд 5 секунд тутам шинэчлэгдэнэ.</p>
        </div>
        <DoctorOnlineStatus />
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
    </div>
  );
}
