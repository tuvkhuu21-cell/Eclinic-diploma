"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { MessageCircle, Mic, MicOff, Paperclip, PhoneOff, Send, Video, VideoOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";

type SignalMessage = {
  id: string;
  type: "offer" | "answer" | "ice";
  payload: RTCSessionDescriptionInit | RTCIceCandidateInit;
  createdAt: string;
};

type VideoMeta = {
  id: string;
  appointmentId?: string | null;
  patientId: string;
  doctorId: string;
  roomId: string;
  status: "waiting" | "ringing" | "active" | "declined" | "ended";
  patient: { user: { firstName: string; lastName?: string } };
  doctor: { user: { firstName: string; lastName?: string }; online?: boolean };
  chatRoom?: { id: string } | null;
};

type ChatMessage = { id: string; content: string; senderId: string };

const iceServers: RTCConfiguration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export function VideoCallRoom({ roomId }: { roomId: string }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const handledSignalsRef = useRef<Set<string>>(new Set());
  const lastSignalAtRef = useRef("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoStartedRef = useRef(false);
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [status, setStatus] = useState<"idle" | "waiting" | "ringing" | "active" | "declined" | "ended">("idle");
  const [notice, setNotice] = useState("Камер, микрофоноо зөвшөөрөөд дуудлага эхлүүлнэ үү.");

  useEffect(() => {
    let cancelled = false;
    async function loadMeta() {
      try {
        const response = await api.get(`/video-calls/${roomId}`);
        if (cancelled) return;
        const next = response.data.data as VideoMeta;
        setMeta(next);
        console.log("video-call: current status", { roomId: next.roomId, status: next.status, appointmentId: next.appointmentId, doctorId: next.doctorId, patientId: next.patientId });
        setStatus(next.status || "waiting");
        if (next.status === "declined") setNotice("Дуудлагаас татгалзсан байна.");
        if (next.status === "ended") setNotice("Дуудлага дууссан байна.");
      } catch {
        if (!cancelled) setNotice("Видео өрөөний мэдээлэл олдсонгүй.");
      }
    }
    loadMeta();
    const timer = window.setInterval(loadMeta, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [roomId]);

  useEffect(() => {
    const accept = new URLSearchParams(window.location.search).get("accept") === "1";
    const start = new URLSearchParams(window.location.search).get("start") === "1";
    if (accept) void acceptCall();
    if (start && !autoStartedRef.current) {
      autoStartedRef.current = true;
      void startCall();
    }
  }, []);

  useEffect(() => {
    if (status !== "waiting" && status !== "ringing" && status !== "active") return;
    const timer = window.setInterval(() => {
      void loadSignals();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (!meta?.chatRoom?.id) return;
    let cancelled = false;
    async function loadMessages() {
      try {
        const response = await api.get(`/chat/rooms/${meta?.chatRoom?.id}/messages`);
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
  }, [meta?.chatRoom?.id]);

  useEffect(() => () => cleanup(false), []);

  async function startCall() {
    setNotice("");
    try {
      const stream = await ensureLocalStream(createPeer());
      const peer = peerRef.current || createPeer();
      stream.getTracks().forEach((track) => {
        if (!peer.getSenders().some((sender) => sender.track === track)) peer.addTrack(track, stream);
      });
      await api.patch("/video-calls", { roomId, status: "ringing" });
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      await sendSignal("offer", offer);
      setStatus("ringing");
      setNotice("Дуудлага илгээгдлээ. Нөгөө тал зөвшөөрөхийг хүлээж байна...");
    } catch {
      setNotice("Камер/микрофон зөвшөөрөл авахад алдаа гарлаа.");
    }
  }

  async function acceptCall() {
    try {
      await ensureLocalStream(peerRef.current || createPeer());
      await api.patch("/video-calls", { roomId, status: "active" });
      setStatus("active");
      setNotice("Дуудлагад нэгдлээ. Холболт хүлээж байна...");
      await loadSignals();
    } catch {
      setNotice("Дуудлагад нэгдэхэд алдаа гарлаа.");
    }
  }

  async function loadSignals() {
    try {
      const response = await api.get(`/video-calls/${roomId}/signal`, { params: { since: lastSignalAtRef.current } });
      const rows = response.data.data as SignalMessage[];
      for (const signal of rows) {
        if (handledSignalsRef.current.has(signal.id)) continue;
        handledSignalsRef.current.add(signal.id);
        lastSignalAtRef.current = signal.createdAt;
        await handleSignal(signal);
      }
    } catch {
      // REST polling can miss a short network tick; keep the media session alive.
    }
  }

  async function handleSignal(signal: SignalMessage) {
    const peer = peerRef.current || createPeer();
    if (signal.type === "offer") {
      await ensureLocalStream(peer);
      await peer.setRemoteDescription(new RTCSessionDescription(signal.payload as RTCSessionDescriptionInit));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      await sendSignal("answer", answer);
      await api.patch("/video-calls", { roomId, status: "active" }).catch(() => null);
      setStatus("active");
      setNotice("Дуудлага холбогдож байна.");
    }
    if (signal.type === "answer" && peer.signalingState !== "stable") {
      await peer.setRemoteDescription(new RTCSessionDescription(signal.payload as RTCSessionDescriptionInit));
      setStatus("active");
      setNotice("Дуудлага холбогдлоо.");
    }
    if (signal.type === "ice") {
      await peer.addIceCandidate(new RTCIceCandidate(signal.payload as RTCIceCandidateInit)).catch(() => null);
    }
  }

  async function ensureLocalStream(peer: RTCPeerConnection) {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    return stream;
  }

  function createPeer() {
    if (peerRef.current) return peerRef.current;
    const peer = new RTCPeerConnection(iceServers);
    peerRef.current = peer;
    peer.ontrack = (event) => {
      const [stream] = event.streams;
      if (remoteVideoRef.current && stream) remoteVideoRef.current.srcObject = stream;
    };
    peer.onicecandidate = (event) => {
      if (event.candidate) void sendSignal("ice", event.candidate.toJSON());
    };
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "connected") {
        setStatus("active");
        setNotice("Дуудлага холбогдлоо.");
      }
      if (peer.connectionState === "failed" || peer.connectionState === "disconnected") setNotice("Холболт тасарсан байж магадгүй.");
    };
    return peer;
  }

  async function sendSignal(type: SignalMessage["type"], payload: SignalMessage["payload"]) {
    await api.post(`/video-calls/${roomId}/signal`, { type, payload });
  }

  function toggleMic() {
    const next = !micOn;
    localStreamRef.current?.getAudioTracks().forEach((track) => { track.enabled = next; });
    setMicOn(next);
  }

  function toggleCamera() {
    const next = !cameraOn;
    localStreamRef.current?.getVideoTracks().forEach((track) => { track.enabled = next; });
    setCameraOn(next);
  }

  async function endCall() {
    await api.patch("/video-calls", { roomId, status: "ended" }).catch(() => null);
    cleanup(true);
    router.push("/chat");
  }

  async function sendMessage() {
    const content = draft.trim();
    if (!content || !meta?.chatRoom?.id) return;
    const response = await api.post("/chat/messages", { roomId: meta.chatRoom.id, content });
    setMessages((current) => [...current, response.data.data as ChatMessage]);
    setDraft("");
  }

  async function sendAttachment(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !meta?.chatRoom?.id) return;
    const data = new FormData();
    data.append("file", file);
    const uploadResponse = await api.post("/chat/upload", data, { headers: { "Content-Type": "multipart/form-data" } });
    const attachment = uploadResponse.data.data as { url: string; name: string; mimeType: string; size: number };
    const response = await api.post("/chat/messages", { roomId: meta.chatRoom.id, content: JSON.stringify({ text: draft.trim(), attachment }) });
    setMessages((current) => [...current, response.data.data as ChatMessage]);
    setDraft("");
  }

  function cleanup(markEnded: boolean) {
    peerRef.current?.close();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (markEnded) {
      setStatus("ended");
      setNotice("Дуудлага дууслаа.");
    }
  }

  const otherName = user?.role === "DOCTOR"
    ? `${meta?.patient.user.lastName || ""} ${meta?.patient.user.firstName || ""}`.trim()
    : `${meta?.doctor.user.lastName || ""} ${meta?.doctor.user.firstName || ""}`.trim();
  const otherOnline = user?.role === "PATIENT" ? Boolean(meta?.doctor.online) : status === "active";

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-white">
      <div className={`grid min-h-[calc(100vh-80px)] ${chatOpen ? "lg:grid-cols-[1fr_360px]" : "grid-cols-1"}`}>
        <main className="relative overflow-hidden bg-slate-950">
          <video ref={remoteVideoRef} autoPlay playsInline className="h-full min-h-[calc(100vh-80px)] w-full bg-slate-900 object-cover" />
          <div className="absolute left-5 top-5 rounded-full bg-slate-900/70 px-4 py-2 text-sm font-bold backdrop-blur">
            {otherName || "Remote user"} · <span className={otherOnline ? "text-emerald-300" : "text-slate-300"}>{otherOnline ? "online" : "offline"}</span>
          </div>
          {notice && <div className="absolute left-1/2 top-5 max-w-md -translate-x-1/2 rounded-full bg-slate-900/70 px-4 py-2 text-center text-sm font-semibold text-cyan-50 backdrop-blur">{notice}</div>}
          <div className="absolute bottom-24 left-5 w-44 overflow-hidden rounded-2xl border border-white/15 bg-slate-900 shadow-2xl md:w-64">
            <video ref={localVideoRef} autoPlay playsInline muted className="aspect-video w-full bg-slate-800 object-cover" />
            <p className="px-3 py-2 text-xs font-bold text-cyan-50">Та</p>
          </div>
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-slate-900/80 px-4 py-3 shadow-2xl backdrop-blur">
            <ControlButton title={micOn ? "Mic off" : "Mic on"} onClick={toggleMic}>{micOn ? <Mic size={19} /> : <MicOff size={19} />}</ControlButton>
            <ControlButton title={cameraOn ? "Camera off" : "Camera on"} onClick={toggleCamera}>{cameraOn ? <Video size={19} /> : <VideoOff size={19} />}</ControlButton>
            <ControlButton title="Chat" onClick={() => setChatOpen((open) => !open)}><MessageCircle size={19} /></ControlButton>
            <button type="button" className="grid h-12 w-12 place-items-center rounded-full bg-rose-600 text-white transition hover:bg-rose-700" onClick={endCall} title="End call">
              <PhoneOff size={21} />
            </button>
          </div>
        </main>

        {chatOpen && (
          <aside className="flex max-h-[calc(100vh-80px)] flex-col border-l border-white/10 bg-white text-slate-700">
            <div className="border-b border-sky-100 p-4">
              <h2 className="font-extrabold text-navy">{otherName || "Чат"}</h2>
              <p className="mt-1 text-xs font-bold text-slate-500"><span className={`mr-2 inline-block h-2 w-2 rounded-full ${otherOnline ? "bg-emerald-500" : "bg-slate-400"}`} />{otherOnline ? "Online" : "Offline"} · {status}</p>
              <div className="mt-3 flex gap-2">
                <Button className="h-9 px-3" disabled={status === "ringing" || status === "active"} onClick={startCall}>Start Call</Button>
                {status === "ringing" && <Button className="h-9 px-3" variant="outline" onClick={acceptCall}>Accept</Button>}
              </div>
            </div>
            <div className="grid flex-1 content-end gap-3 overflow-y-auto p-4">
              {messages.map((message) => <MessageBubble key={message.id} mine={message.senderId === user?.id} text={message.content} />)}
              {messages.length === 0 && <p className="rounded-xl bg-cyanSoft p-4 text-sm font-semibold text-medical">Чатад зурвас алга.</p>}
            </div>
            <div className="flex gap-2 border-t border-sky-100 p-3">
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={sendAttachment} />
              <Button variant="outline" className="w-11 px-0" aria-label="Файл хавсаргах" onClick={() => fileInputRef.current?.click()}><Paperclip size={17} /></Button>
              <Input placeholder="Зурвас бичих" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendMessage(); }} />
              <Button className="w-11 px-0" aria-label="Илгээх" onClick={sendMessage}><Send size={17} /></Button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function ControlButton({ title, onClick, children }: { title: string; onClick: () => void; children: ReactNode }) {
  return <button type="button" title={title} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20" onClick={onClick}>{children}</button>;
}
