import { prisma } from "@/lib/prisma";

export const chatService = {
  rooms: (userId: string) => prisma.chatRoom.findMany({ where: { OR: [{ patient: { userId } }, { doctor: { userId } }] }, include: { messages: { take: 1, orderBy: { createdAt: "desc" } } } }),
  messages: (roomId: string) => prisma.message.findMany({ where: { roomId }, orderBy: { createdAt: "asc" } }),
  send: (userId: string, data: { roomId: string; content: string }) => prisma.message.create({ data: { roomId: data.roomId, senderId: userId, content: data.content } }),
};

