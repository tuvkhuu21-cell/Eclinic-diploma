import { VideoCallRoom } from "@/components/video/VideoCallRoom";

export default async function VideoCallPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return <section className="mx-auto max-w-6xl px-4 py-10"><VideoCallRoom roomId={roomId} /></section>;
}
