import { prisma } from "@/lib/prisma";
export const labService = { lookup: (code: string) => prisma.labResult.findUnique({ where: { code }, include: { patient: { include: { user: true } } } }) };

