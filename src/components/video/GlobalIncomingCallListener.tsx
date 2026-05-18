"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PhoneOff, Video, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { broadcastRealtime, removeRealtimeChannel, subscribeBroadcast } from "@/lib/supabase-realtime";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/services/api";

type IncomingVideoCall = {
  roomId: string;
  appointmentId?: string;
  callerId?: string;
  callerName?: string;
  patient?: { user?: { firstName?: string; lastName?: string } };
  doctor?: { user?: { firstName?: string; lastName?: string } };
};

export function GlobalIncomingCallListener() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [incoming, setIncoming] = useState<IncomingVideoCall | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const userId = user?.id ?? null;
  const enabled = Boolean(userId);
  const isVideoPage = pathname?.startsWith("/video-call");

  const callerName = useMemo(() => incoming?.callerName || "MediConnect хэрэглэгч", [incoming?.callerName]);

  useEffect(() => {
    if (!enabled || !userId || isVideoPage) return;
    const channel = subscribeBroadcast<IncomingVideoCall>(`user-notifications-${userId}`, "incoming-video-call", (payload) => {
      setIncoming(payload);
    });
    return () => removeRealtimeChannel(channel);
  }, [enabled, userId, isVideoPage]);

  useEffect(() => {
    if (!enabled || !userId || isVideoPage || incoming) return;
    let cancelled = false;
    async function checkIncomingCall() {
      try {
        const response = await api.get("/video-calls", { params: { status: "ringing" } });
        if (cancelled) return;
        const calls = response.data.data as IncomingVideoCall[];
        const call = calls.find((item) => item.roomId);
        if (!call) return;
        const caller = user?.role === "DOCTOR" ? call.patient?.user : call.doctor?.user;
        setIncoming({
          roomId: call.roomId,
          appointmentId: call.appointmentId,
          callerName: `${caller?.lastName || ""} ${caller?.firstName || ""}`.trim() || "MediConnect хэрэглэгч",
        });
      } catch {
        // Keep the listener quiet during transient LAN/API failures.
      }
    }
    void checkIncomingCall();
    const timer = window.setInterval(checkIncomingCall, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [enabled, userId, isVideoPage, incoming, user?.role]);

  useEffect(() => {
    if (!incoming) {
      stopRingtone();
      return;
    }
    startRingtone();
    return () => stopRingtone();
  }, [incoming?.roomId]);

  async function acceptCall() {
    if (!incoming) return;
    stopRingtone();
    await api.patch("/video-calls", { roomId: incoming.roomId, status: "active" }).catch(() => null);
    await broadcastRealtime(`video-call-${incoming.roomId}`, "call-accepted", { roomId: incoming.roomId, userId });
    router.push(`/video-call/${incoming.roomId}?accept=1`);
    setIncoming(null);
  }

  async function declineCall() {
    if (!incoming) return;
    stopRingtone();
    await api.patch("/video-calls", { roomId: incoming.roomId, status: "declined" }).catch(() => null);
    await broadcastRealtime(`video-call-${incoming.roomId}`, "call-declined", { roomId: incoming.roomId, userId });
    setIncoming(null);
  }

  function startRingtone() {
    try {
      const AudioCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor || oscillatorRef.current) return;
      const context = audioRef.current || new AudioCtor();
      audioRef.current = context;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gain.gain.value = 0.04;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillatorRef.current = oscillator;
      gainRef.current = gain;
    } catch {
      // Browser may block audio before user interaction; popup remains visible.
    }
  }

  function stopRingtone() {
    try {
      oscillatorRef.current?.stop();
      oscillatorRef.current?.disconnect();
      gainRef.current?.disconnect();
    } catch {
      // Already stopped.
    }
    oscillatorRef.current = null;
    gainRef.current = null;
  }

  if (!incoming) return null;

  return (
    <div className="fixed inset-0 z-[160] grid place-items-center bg-slate-900/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 text-center shadow-[0_24px_80px_rgba(14,116,144,0.25)]">
        <button type="button" className="ml-auto grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100" onClick={declineCall} aria-label="Close incoming call">
          <X size={17} />
        </button>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-cyanSoft text-medical">
          <Video size={28} />
        </div>
        <h2 className="mt-4 text-xl font-extrabold text-navy">Видео дуудлага ирлээ</h2>
        <p className="mt-2 text-sm font-semibold text-slate-600">{callerName}</p>
        <div className="mt-5 flex justify-center gap-3">
          <button type="button" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700" onClick={acceptCall}>
            <Video size={16} /> Accept
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-bold text-white hover:bg-rose-700" onClick={declineCall}>
            <PhoneOff size={16} /> Decline
          </button>
        </div>
      </div>
    </div>
  );
}
