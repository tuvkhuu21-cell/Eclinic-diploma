import { prisma } from "@/lib/prisma";

export const doctorService = {
  list: (query: { q?: string | null; specialty?: string | null }) =>
    prisma.doctorProfile.findMany({
      where: {
        specialty: query.specialty ? { contains: query.specialty, mode: "insensitive" } : undefined,
        user: query.q ? { OR: [{ firstName: { contains: query.q, mode: "insensitive" } }, { lastName: { contains: query.q, mode: "insensitive" } }] } : undefined,
      },
      include: { user: true, hospital: true, departments: true },
    }),
  detail: (id: string) => prisma.doctorProfile.findUnique({ where: { id }, include: { user: true, hospital: true, departments: true, appointments: true } }),
};

