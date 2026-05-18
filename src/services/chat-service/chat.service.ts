import { prisma } from "@/lib/prisma";
import { broadcastRealtimeServer } from "@/lib/supabase-realtime-server";

export const chatService = {
  async rooms(userId: string) {
    const rooms = await prisma.chatRoom.findMany({
      where: { OR: [{ patient: { userId } }, { doctor: { userId } }] },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, hospital: true } },
        messages: { take: 1, orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return Promise.all(rooms.map(async (room) => {
      const appointment = await prisma.appointment.findFirst({
        where: {
          patientId: room.patientId,
          doctorId: room.doctorId,
          type: "ONLINE",
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        include: { videoCall: true },
        orderBy: { scheduledAt: "desc" },
      });
      return {
        ...room,
        appointment: appointment ? {
          id: appointment.id,
          type: appointment.type,
          scheduledAt: appointment.scheduledAt,
          durationMinutes: appointment.durationMinutes,
          status: appointment.status,
          paymentStatus: appointment.paymentStatus,
          videoCall: appointment.videoCall,
        } : null,
      };
    }));
  },
  messages: (roomId: string) => prisma.message.findMany({ where: { roomId }, include: { sender: true }, orderBy: { createdAt: "asc" } }),
  async send(userId: string, data: { roomId: string; content: string }) {
    const room = await prisma.chatRoom.findUnique({
      where: { id: data.roomId },
      include: { patient: true, doctor: true },
    });
    const message = await prisma.message.create({ data: { roomId: data.roomId, senderId: userId, content: data.content } });
    const recipientUserId = room?.patient.userId === userId ? room.doctor.userId : room?.patient.userId;
    if (recipientUserId) {
      const notification = await prisma.notification.create({
        data: {
          userId: recipientUserId,
          title: "Шинэ чат зурвас",
          body: "Танд шинэ чат зурвас ирлээ.",
          type: "CHAT",
        },
      });
      await broadcastRealtimeServer(`user-notifications-${recipientUserId}`, "new-notification", notification).catch(() => null);
    }
    return message;
  },
};
