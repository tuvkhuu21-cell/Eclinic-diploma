import { prisma } from "@/lib/prisma";

export const userService = {
  list: () => prisma.user.findMany({ select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, createdAt: true } }),
  me: (id: string) => prisma.user.findUnique({ where: { id }, include: { patientProfile: true, doctorProfile: true } }),
};

