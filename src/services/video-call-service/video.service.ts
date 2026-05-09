import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";

export const videoService = {
  async request(userId: string, data: { doctorId: string; appointmentId?: string }) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new ApiError(403, "Patient profile required");
    return prisma.videoCall.create({ data: { patientId: patient.id, doctorId: data.doctorId, appointmentId: data.appointmentId, roomId: `room-${Date.now()}` } });
  },
};

