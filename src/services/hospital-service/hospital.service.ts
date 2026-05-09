import { prisma } from "@/lib/prisma";

export const hospitalService = {
  list: (query: { q?: string | null; district?: string | null }) =>
    prisma.hospital.findMany({
      where: {
        name: query.q ? { contains: query.q, mode: "insensitive" } : undefined,
        district: query.district ? { contains: query.district, mode: "insensitive" } : undefined,
      },
      include: { departments: true },
    }),
  detail: (id: string) => prisma.hospital.findUnique({ where: { id }, include: { departments: true, doctors: { include: { user: true } } } }),
};

