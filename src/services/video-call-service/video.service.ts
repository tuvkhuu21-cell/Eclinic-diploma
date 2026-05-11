import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";

const closedStatuses = new Set(["ended", "declined"]);

export const videoService = {
  async getByRoom(userId: string, roomId: string) {
    const call = await prisma.videoCall.findUnique({
      where: { roomId },
      include: {
        appointment: true,
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });
    if (!call) throw new ApiError(404, "Video call not found");
    if (call.patient.userId !== userId && call.doctor.userId !== userId) throw new ApiError(403, "Video call access denied");
    const chatRoom = await prisma.chatRoom.findFirst({ where: { patientId: call.patientId, doctorId: call.doctorId }, select: { id: true } });
    return { ...call, chatRoom };
  },
  async request(userId: string, data: { doctorId: string; appointmentId?: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { patientProfile: true, doctorProfile: true } });
    if (!user) throw new ApiError(401, "Authentication required");

    const appointment = data.appointmentId ? await prisma.appointment.findUnique({ where: { id: data.appointmentId } }) : null;
    if (appointment && appointment.type !== "ONLINE") throw new ApiError(400, "Video call is available only for online appointments");
    const patientId = appointment?.patientId || user.patientProfile?.id;
    const doctorId = appointment?.doctorId || data.doctorId || user.doctorProfile?.id;
    if (!patientId || !doctorId) throw new ApiError(400, "Video call requires patient and doctor");

    const existing = data.appointmentId ? await prisma.videoCall.findUnique({ where: { appointmentId: data.appointmentId } }) : null;
    if (existing && !closedStatuses.has(existing.status)) {
      console.log("video-call: reuse open room", { roomId: existing.roomId, status: existing.status, appointmentId: existing.appointmentId, doctorId: existing.doctorId, patientId: existing.patientId });
      return existing;
    }
    if (existing) {
      const roomId = createRoomId(data.appointmentId, patientId, doctorId);
      const reopened = await prisma.videoCall.update({
        where: { id: existing.id },
        data: { roomId, status: "waiting", startedAt: null, endedAt: null },
      });
      console.log("video-call: reopened closed room with new roomId", { roomId, oldRoomId: existing.roomId, appointmentId: reopened.appointmentId, doctorId: reopened.doctorId, patientId: reopened.patientId });
      return reopened;
    }

    const roomId = createRoomId(data.appointmentId, patientId, doctorId);
    const created = await prisma.videoCall.create({
      data: {
        patientId,
        doctorId,
        appointmentId: data.appointmentId,
        roomId,
        status: "waiting",
      },
    });
    console.log("video-call: created room", { roomId: created.roomId, appointmentId: created.appointmentId, doctorId: created.doctorId, patientId: created.patientId });
    return created;
  },
  async start(roomId: string) {
    return prisma.videoCall.update({ where: { roomId }, data: { status: "active", startedAt: new Date() } });
  },
  async updateStatus(userId: string, roomId: string, status: "waiting" | "ringing" | "active" | "declined" | "ended") {
    await this.getByRoom(userId, roomId);
    const updated = await prisma.videoCall.update({
      where: { roomId },
      data: {
        status,
        startedAt: status === "active" ? new Date() : undefined,
        endedAt: status === "ended" || status === "declined" ? new Date() : undefined,
      },
    });
    console.log("video-call: status updated", { roomId, status, appointmentId: updated.appointmentId, doctorId: updated.doctorId, patientId: updated.patientId });
    return updated;
  },
};

function createRoomId(appointmentId: string | undefined, patientId: string, doctorId: string) {
  const seed = appointmentId || `${patientId}-${doctorId}`;
  return `video-${seed}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}
