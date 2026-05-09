import { prisma } from "@/lib/prisma";
export const notificationService = {
  list: (userId: string) => prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  create: (data: { userId: string; title: string; body?: string; type?: string }) => prisma.notification.create({ data }),
  markRead: (id: string) => prisma.notification.update({ where: { id }, data: { readAt: new Date() } }),
};
