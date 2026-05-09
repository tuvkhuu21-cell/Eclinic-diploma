import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";

export const appointmentService = {
  list: (userId: string) => prisma.appointment.findMany({ where: { OR: [{ patient: { userId } }, { doctor: { userId } }] }, include: { doctor: { include: { user: true } }, hospital: true }, orderBy: { scheduledAt: "asc" } }),
  async create(userId: string, data: { doctorId: string; hospitalId?: string; scheduledAt: string; reason: string }) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new ApiError(403, "Patient profile required");
    return prisma.appointment.create({ data: { patientId: patient.id, doctorId: data.doctorId, hospitalId: data.hospitalId, scheduledAt: new Date(data.scheduledAt), reason: data.reason } });
  },
};

