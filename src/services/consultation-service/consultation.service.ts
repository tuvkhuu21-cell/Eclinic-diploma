import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";

export const consultationService = {
  list: (userId: string) => prisma.consultation.findMany({ where: { OR: [{ patient: { userId } }, { doctor: { userId } }] } }),
  async create(userId: string, data: { doctorId?: string; symptoms: string }) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new ApiError(403, "Patient profile required");
    return prisma.consultation.create({ data: { patientId: patient.id, doctorId: data.doctorId, symptoms: data.symptoms } });
  },
};

