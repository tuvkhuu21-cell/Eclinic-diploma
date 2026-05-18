"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ImageIcon, MessageCircle, Mic, MicOff, Paperclip, PhoneOff, Send, Smile, Video, VideoOff, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";
import { broadcastRealtime, removeRealtimeChannel, subscribeBroadcast } from "@/lib/supabase-realtime";

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

function getIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ];
  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
  if (turnUrl) {
    servers.push({
      urls: turnUrl,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME,
      credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL,
    });
  }
  return servers;
}

const iceServers: RTCConfiguration = {
  iceServers: getIceServers(),
  bundlePolicy: "max-bundle",
  iceCandidatePoolSize: 8,
};

export function VideoCallRoom({ roomId }: { roomId: string }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const handledSignalsRef = useRef<Set<string>>(new Set());
  const handledSignalPayloadsRef = useRef<Set<string>>(new Set());
  const lastSignalAtRef = useRef("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoStartedRef = useRef(false);
  const startAfterAcceptRef = useRef(false);
  const startedRef = useRef(false);
  const acceptedRef = useRef(false);
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [status, setStatus] = useState<"idle" | "waiting" | "ringing" | "active" | "declined" | "ended">("idle");
  const [notice, setNotice] = useState("Камер, микрофоноо зөвшөөрөөд дуудлага эхлүүлнэ үү.");
  const [permissionError, setPermissionError] = useState("");

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
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  useEffect(() => {
    const accept = new URLSearchParams(window.location.search).get("accept") === "1";
    const start = new URLSearchParams(window.location.search).get("start") === "1";
    if (accept) void acceptCall();
    if (start && !autoStartedRef.current) {
      autoStartedRef.current = true;
      startAfterAcceptRef.current = true;
      void ringCall();
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void loadSignals();
      if (startAfterAcceptRef.current && !startedRef.current) void checkAcceptedAndStart();
    }, 450);
    return () => window.clearInterval(timer);
  }, [roomId]);

  useEffect(() => {
    const offerChannel = subscribeBroadcast<SignalMessage | { id?: string; payload?: SignalMessage["payload"] }>(`video-call-${roomId}`, "offer", (signal) => {
      void handleSignal({
        id: signal.id || crypto.randomUUID(),
        type: "offer",
        payload: signal.payload as SignalMessage["payload"],
        createdAt: new Date().toISOString(),
      });
    });
    const answerChannel = subscribeBroadcast<SignalMessage | { id?: string; payload?: SignalMessage["payload"] }>(`video-call-${roomId}`, "answer", (signal) => {
      void handleSignal({
        id: signal.id || crypto.randomUUID(),
        type: "answer",
        payload: signal.payload as SignalMessage["payload"],
        createdAt: new Date().toISOString(),
      });
    });
    const iceChannel = subscribeBroadcast<SignalMessage | { id?: string; payload?: SignalMessage["payload"] }>(`video-call-${roomId}`, "ice-candidate", (signal) => {
      void handleSignal({
        id: signal.id || crypto.randomUUID(),
        type: "ice",
        payload: signal.payload as SignalMessage["payload"],
        createdAt: new Date().toISOString(),
      });
    });
    const statusChannel = subscribeBroadcast<{ roomId: string }>(`video-call-${roomId}`, "call-accepted", () => {
      setStatus("active");
      setNotice("Дуудлага зөвшөөрөгдлөө. Холболт хийгдэж байна.");
      if (startAfterAcceptRef.current && !startedRef.current) void startCall();
    });
    const declinedChannel = subscribeBroadcast<{ roomId: string }>(`video-call-${roomId}`, "call-declined", () => {
      setStatus("declined");
      setNotice("Дуудлагаас татгалзсан байна.");
    });
    const endedChannel = subscribeBroadcast<{ roomId: string }>(`video-call-${roomId}`, "call-ended", () => {
      cleanup(true);
      setNotice("Дуудлага дууссан байна.");
    });
    return () => {
      removeRealtimeChannel(offerChannel);
      removeRealtimeChannel(answerChannel);
      removeRealtimeChannel(iceChannel);
      removeRealtimeChannel(statusChannel);
      removeRealtimeChannel(declinedChannel);
      removeRealtimeChannel(endedChannel);
    };
  }, [roomId]);

  useEffect(() => {
    if (!meta?.chatRoom?.id) return;
    let cancelled = false;
    const chatRoomId = meta.chatRoom.id;
    async function loadMessages() {
      try {
        const response = await api.get(`/chat/rooms/${chatRoomId}/messages`);
        if (!cancelled) setMessages(response.data.data as ChatMessage[]);
      } catch {
        if (!cancelled) setMessages([]);
      }
    }
    loadMessages();
    const channel = subscribeBroadcast<ChatMessage>(`chat-room-${chatRoomId}`, "new-message", (message) => {
      setMessages((current) => [...current.filter((item) => item.id !== message.id), message]);
    });
    return () => {
      cancelled = true;
      removeRealtimeChannel(channel);
    };
  }, [meta?.chatRoom?.id]);

  useEffect(() => () => cleanup(false), []);

  async function ringCall() {
    await api.patch("/video-calls", { roomId, status: "ringing" }).catch(() => null);
    setStatus("ringing");
    setNotice("Дуудлага илгээгдлээ. Нөгөө тал зөвшөөрөхийг хүлээж байна...");
  }

  async function startCall() {
    if (startedRef.current) return;
    startedRef.current = true;
    setNotice("");
    setPermissionError("");
    try {
      const stream = await ensureLocalStream(createPeer());
      const peer = peerRef.current || createPeer();
      stream.getTracks().forEach((track) => {
        if (!peer.getSenders().some((sender) => sender.track === track)) peer.addTrack(track, stream);
      });
      await tuneOutboundMedia(peer);
      await api.patch("/video-calls", { roomId, status: "active" }).catch(() => null);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      await sendSignal("offer", offer);
      setStatus("active");
      setNotice("Холболт хийгдэж байна...");
    } catch (error) {
      startedRef.current = false;
      setPermissionError(getMediaErrorMessage(error));
      setNotice("Камер/микрофон зөвшөөрөл авахад алдаа гарлаа.");
    }
  }

  async function acceptCall() {
    if (acceptedRef.current) return;
    acceptedRef.current = true;
    setPermissionError("");
    try {
      await ensureLocalStream(peerRef.current || createPeer());
      await api.patch("/video-calls", { roomId, status: "active" });
      await broadcastRealtime(`video-call-${roomId}`, "call-accepted", { roomId, userId: user?.id });
      setStatus("active");
      setNotice("Дуудлагад нэгдлээ. Холболт хүлээж байна...");
    } catch (error) {
      acceptedRef.current = false;
      setPermissionError(getMediaErrorMessage(error));
      setNotice("Дуудлагад нэгдэхэд алдаа гарлаа.");
    }
  }

  async function handleSignal(signal: SignalMessage) {
    if (!signal.type || handledSignalsRef.current.has(signal.id)) return;
    const payloadKey = `${signal.type}:${JSON.stringify(signal.payload)}`;
    if (handledSignalPayloadsRef.current.has(payloadKey)) return;
    handledSignalsRef.current.add(signal.id);
    handledSignalPayloadsRef.current.add(payloadKey);
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

  async function loadSignals() {
    try {
      const response = await api.get(`/video-calls/${roomId}/signal`, { params: { since: lastSignalAtRef.current } });
      const rows = response.data.data as SignalMessage[];
      for (const signal of rows) {
        if (signal.createdAt && signal.createdAt > lastSignalAtRef.current) lastSignalAtRef.current = signal.createdAt;
        await handleSignal(signal);
      }
    } catch {
      // Supabase broadcast is primary; REST signaling is a quiet local fallback.
    }
  }

  async function checkAcceptedAndStart() {
    try {
      const response = await api.get(`/video-calls/${roomId}`);
      const next = response.data.data as VideoMeta;
      if (next.status === "active") void startCall();
      if (next.status === "declined") {
        setStatus("declined");
        setNotice("Дуудлагаас татгалзсан байна.");
      }
      if (next.status === "ended") {
        cleanup(true);
        setNotice("Дуудлага дууссан байна.");
      }
    } catch {
      // Keep waiting quietly.
    }
  }

  async function ensureLocalStream(peer: RTCPeerConnection) {
    if (localStreamRef.current) return localStreamRef.current;
    if (isInsecureLan()) throw new Error("INSECURE_LAN_CONTEXT");
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("MEDIA_UNSUPPORTED");
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 60, max: 60 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: { ideal: 1 },
          sampleRate: { ideal: 48000 },
        },
      });
    } catch (initialError) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        setCameraOn(false);
        setMicOn(true);
        setPermissionError("Камер ажиллахгүй байна. Одоогоор audio-only горимоор үргэлжилнэ.");
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setCameraOn(true);
          setMicOn(false);
          setPermissionError("Микрофон ажиллахгүй байна. Одоогоор video-only горимоор үргэлжилнэ.");
        } catch {
          throw initialError;
        }
      }
    }
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    await tuneOutboundMedia(peer);
    return stream;
  }

  function createPeer() {
    if (peerRef.current) return peerRef.current;
    const peer = new RTCPeerConnection(iceServers);
    peerRef.current = peer;
    peer.oniceconnectionstatechange = () => {
      if (peer.iceConnectionState === "checking") setNotice("Видео холболт шалгаж байна...");
      if (peer.iceConnectionState === "connected" || peer.iceConnectionState === "completed") setNotice("Дуудлага холбогдлоо.");
      if (peer.iceConnectionState === "failed") {
        void peer.restartIce?.();
        setNotice("Холболтыг дахин сэргээж байна...");
      }
    };
    peer.ontrack = (event) => {
      const [stream] = event.streams;
      if (remoteVideoRef.current && stream) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch(() => null);
      }
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
    const eventName = type === "ice" ? "ice-candidate" : type;
    await api.post(`/video-calls/${roomId}/signal`, { type, payload }).catch(() => null);
    await broadcastRealtime(`video-call-${roomId}`, eventName, {
      id: crypto.randomUUID(),
      type,
      payload,
      senderId: user?.id,
      createdAt: new Date().toISOString(),
    });
  }

  async function tuneOutboundMedia(peer: RTCPeerConnection) {
    for (const sender of peer.getSenders()) {
      if (sender.track?.kind !== "video") continue;
      const parameters = sender.getParameters();
      parameters.encodings = [{
        ...(parameters.encodings?.[0] || {}),
        maxBitrate: 3_500_000,
        maxFramerate: 60,
        scaleResolutionDownBy: 1,
        networkPriority: "high",
      }];
      parameters.degradationPreference = "balanced";
      await sender.setParameters(parameters).catch(() => null);
    }
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
    await broadcastRealtime(`video-call-${roomId}`, "call-ended", { roomId, userId: user?.id });
    cleanup(true);
    router.push("/chat");
  }

  async function sendMessage() {
    const content = draft.trim();
    if (!content || !meta?.chatRoom?.id) return;
    const response = await api.post("/chat/messages", { roomId: meta.chatRoom.id, content });
    const saved = response.data.data as ChatMessage;
    setMessages((current) => [...current, saved]);
    await broadcastRealtime(`chat-room-${meta.chatRoom.id}`, "new-message", saved);
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
    const saved = response.data.data as ChatMessage;
    setMessages((current) => [...current, saved]);
    await broadcastRealtime(`chat-room-${meta.chatRoom.id}`, "new-message", saved);
    setDraft("");
  }

  function cleanup(markEnded: boolean) {
    startedRef.current = false;
    acceptedRef.current = false;
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
  const lanPermissionWarning = isInsecureLan();

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden bg-slate-950 text-white">
      <div className={`grid h-dvh w-screen ${chatOpen ? "lg:grid-cols-[minmax(0,1fr)_420px]" : "grid-cols-1"}`}>
        <main className="relative min-h-0 overflow-hidden bg-slate-950">
          <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full bg-slate-950 object-cover" />
          <div className="absolute left-6 top-6 rounded-full bg-slate-900/70 px-4 py-2 text-sm font-bold backdrop-blur">
            {otherName || "Remote user"} · <span className={otherOnline ? "text-emerald-300" : "text-slate-300"}>{otherOnline ? "online" : "offline"}</span>
          </div>
          {notice && <div className="absolute left-1/2 top-6 max-w-md -translate-x-1/2 rounded-full bg-slate-900/70 px-4 py-2 text-center text-sm font-semibold text-cyan-50 backdrop-blur">{notice}</div>}
          {(permissionError || lanPermissionWarning) && (
            <div className="absolute left-1/2 top-20 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900 shadow-2xl">
              {lanPermissionWarning && <p>LAN/IP хаягаар камер ашиглахын тулд HTTPS шаардлагатай байж болно.</p>}
              {permissionError && <p className={lanPermissionWarning ? "mt-2" : ""}>{permissionError}</p>}
              {permissionError && (
                <button type="button" className="mt-3 rounded-full bg-medical px-4 py-2 text-xs font-bold text-white hover:bg-sky-600" onClick={() => void ensureLocalStream(peerRef.current || createPeer()).then(() => setPermissionError("")).catch((error) => setPermissionError(getMediaErrorMessage(error)))}>
                  Камер/микрофон дахин зөвшөөрөх
                </button>
              )}
            </div>
          )}
          <div className="absolute bottom-24 left-6 w-44 overflow-hidden rounded-2xl border border-white/15 bg-slate-900 shadow-2xl md:w-72">
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
          <aside className="flex min-h-0 flex-col border-l border-slate-200 bg-white text-slate-900 shadow-[-20px_0_60px_rgba(15,23,42,0.15)]">
            <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-200 to-cyan-100 text-sm font-black text-[#0084ff]">
                  {getInitials(otherName || "MC")}
                  <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${otherOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-extrabold text-slate-950">{otherName || "Чат"}</h2>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500">{otherOnline ? "Active now" : "Offline"} · {status}</p>
                </div>
              </div>
              <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100" onClick={() => setChatOpen(false)} aria-label="Close chat">
                <X size={18} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-white px-5 py-4 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]">
              <div className="mt-auto" />
              {messages.map((message) => <MessageBubble key={message.id} mine={message.senderId === user?.id} text={message.content} />)}
              {messages.length === 0 && <p className="rounded-2xl bg-[#f0f2f5] p-4 text-sm font-semibold text-slate-600">Чатад зурвас алга.</p>}
            </div>
            <div className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={sendAttachment} />
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full text-[#0084ff] hover:bg-blue-50" aria-label="Файл хавсаргах" onClick={() => fileInputRef.current?.click()}><Paperclip size={19} /></button>
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full text-[#0084ff] hover:bg-blue-50" aria-label="Зураг"><ImageIcon size={19} /></button>
              <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#f0f2f5] px-4">
                <input className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-500" placeholder="Aa" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendMessage(); }} />
                <Smile className="text-[#0084ff]" size={20} />
              </div>
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-[#0084ff] text-white hover:bg-blue-600" aria-label="Илгээх" onClick={sendMessage}><Send size={17} /></button>
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

function getMediaErrorMessage(error: unknown) {
  const name = error instanceof DOMException || error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : "";
  if (message === "INSECURE_LAN_CONTEXT") return "LAN/IP HTTP хаяг дээр Chrome камер/микрофоныг хориглодог. Video call тест хийхдээ энэ төхөөрөмж дээр localhost ашиглах эсвэл HTTPS/Chrome insecure-origin allow тохиргоо хэрэгтэй.";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") return "Browser camera/mic permission denied байна. Address bar дээрх camera icon эсвэл site settings-ээс зөвшөөрөөд дахин оролдоно уу.";
  if (name === "NotFoundError" || name === "DevicesNotFoundError") return "Камер эсвэл микрофон төхөөрөмж олдсонгүй. Төхөөрөмжөө холбосон эсэхийг шалгана уу.";
  if (name === "NotReadableError" || name === "TrackStartError") return "Камер/микрофоныг өөр app ашиглаж байж магадгүй. Тэр app-аа хаагаад дахин оролдоно уу.";
  if (name === "OverconstrainedError") return "Сонгосон камер/микрофон тохиргоо дэмжигдэхгүй байна.";
  if (name === "SecurityError" || name === "MEDIA_UNSUPPORTED") return "Энэ browser эсвэл холболт camera/mic ашиглахыг зөвшөөрөхгүй байна. LAN IP дээр HTTP ашиглаж байгаа бол Chrome camera/mic-ийг хориглодог. Localhost эсвэл HTTPS ашиглаарай.";
  return "Камер/микрофон зөвшөөрөл авахад алдаа гарлаа. Browser permission болон төхөөрөмжөө шалгаад дахин оролдоно уу.";
}

function isInsecureLan() {
  return typeof window !== "undefined" && window.location.protocol === "http:" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
}

function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MC";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}
