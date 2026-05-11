import { prisma } from "@/lib/prisma";

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
  send: (userId: string, data: { roomId: string; content: string }) => prisma.message.create({ data: { roomId: data.roomId, senderId: userId, content: data.content } }),
};
