import { VideoCallRoom } from "@/components/video/VideoCallRoom";

export default async function VideoCallPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return <VideoCallRoom roomId={roomId} />;
}
