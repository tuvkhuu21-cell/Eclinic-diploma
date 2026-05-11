import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";

const DEFAULT_ONLINE_PRICE = 30000;

export const appointmentService = {
  list: (userId: string) => prisma.appointment.findMany({ where: { OR: [{ patient: { userId } }, { doctor: { userId } }] }, include: { doctor: { include: { user: true } }, patient: { include: { user: true } }, hospital: true }, orderBy: { scheduledAt: "asc" } }),
  async my(userId: string) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) return [];
    const rows = await prisma.$queryRaw<Array<{ id: string; patientId: string; doctorId: string; hospitalId: string | null; scheduledAt: Date; reason: string; status: string; createdAt: Date }>>`
      SELECT "id", "patientId", "doctorId", "hospitalId", "scheduledAt", "reason", "status", "createdAt"
      FROM "Appointment"
      WHERE "patientId" = ${patient.id}
      ORDER BY "scheduledAt" ASC
    `;
    const appointments = await Promise.all(rows.map(async (appointment) => {
      const [doctor, chatRoom, videoCall] = await Promise.all([
        prisma.doctorProfile.findUnique({ where: { id: appointment.doctorId }, include: { user: true, hospital: true } }),
        prisma.chatRoom.findFirst({ where: { patientId: patient.id, doctorId: appointment.doctorId }, select: { id: true } }),
        prisma.videoCall.findUnique({ where: { appointmentId: appointment.id }, select: { roomId: true, status: true } }).catch(() => null),
      ]);
      if (!doctor) return null;
      const appointmentType = appointment.reason?.includes("Багц шинжилгээ")
        ? "PACKAGE_ORDER"
        : appointment.reason?.includes("Биечлэн")
          ? "HOSPITAL_VISIT"
          : "ONLINE";
      return {
        ...appointment,
        durationMinutes: 30,
        type: appointmentType,
        price: doctor.fee > 0 ? doctor.fee : 30000,
        paymentStatus: appointment.status === "CONFIRMED" || appointment.status === "COMPLETED" ? "PAID" : "PENDING",
        room: extractRoom(appointment.reason),
        specialty: extractSpecialty(appointment.reason, doctor.specialty),
        packageName: extractPackageName(appointment.reason),
        labName: extractPackageLabName(appointment.reason),
        doctor: { ...doctor, chatRooms: chatRoom ? [chatRoom] : [] },
        videoCall,
        hospital: doctor?.hospital || null,
      };
    }));
    return appointments.filter(Boolean);
  },
  doctor: (userId: string) => prisma.appointment.findMany({ where: { doctor: { userId } }, include: { patient: { include: { user: true, chatRooms: { where: { doctor: { userId } }, select: { id: true } } } }, hospital: true, videoCall: true }, orderBy: { scheduledAt: "asc" } }),
  async create(userId: string, data: { doctorId: string; hospitalId?: string; scheduledAt: string; reason: string; durationMinutes?: number; type?: string; price?: number; paymentStatus?: string }) {
    const patient = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) throw new ApiError(403, "Patient profile required");
    const doctor = await prisma.doctorProfile.findUnique({ where: { id: data.doctorId }, include: { user: true } });
    if (!doctor) throw new ApiError(404, "Doctor not found");
    return prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: data.doctorId,
          hospitalId: data.hospitalId || doctor.hospitalId,
          scheduledAt: new Date(data.scheduledAt),
          durationMinutes: data.durationMinutes || 30,
          type: data.type || "ONLINE",
          price: data.price && data.price > 0 ? data.price : doctor.fee > 0 ? doctor.fee : DEFAULT_ONLINE_PRICE,
          paymentStatus: data.paymentStatus || "PAID",
          reason: data.reason,
          status: data.paymentStatus === "PAID" ? "CONFIRMED" : "PENDING",
        },
        include: { doctor: { include: { user: true, hospital: true } }, patient: { include: { user: true } } },
      });
      const chatRoom = await tx.chatRoom.findFirst({ where: { patientId: patient.id, doctorId: doctor.id }, select: { id: true } })
        || await tx.chatRoom.create({ data: { patientId: patient.id, doctorId: doctor.id }, select: { id: true } });
      await tx.notification.createMany({
        data: [
          {
            userId,
            title: "Төлбөр төлөгдлөө",
            body: "Төлбөр төлөгдлөө. Таны онлайн цаг баталгаажлаа.",
            type: "PAYMENT",
          },
          {
            userId: doctor.userId,
            title: "Шинэ онлайн цаг захиалга",
            body: "Шинэ онлайн цаг захиалга ирлээ.",
            type: "APPOINTMENT",
          },
        ],
      });
      return { ...appointment, chatRoom };
    });
  },
};

function extractRoom(reason?: string) {
  const match = reason?.match(/Өрөө\s+([^-\s]+)/);
  return match?.[1] || "";
}

function extractSpecialty(reason: string | undefined, fallback: string) {
  if (!reason?.includes("Биечлэн")) return fallback;
  const parts = reason.split(" - ").map((part) => part.trim()).filter(Boolean);
  return parts[2] || fallback;
}

function extractPackageName(reason?: string) {
  if (!reason?.includes("Багц шинжилгээ")) return "";
  const parts = reason.split(" - ").map((part) => part.trim()).filter(Boolean);
  return parts[1] || "";
}

function extractPackageLabName(reason?: string) {
  if (!reason?.includes("Багц шинжилгээ")) return "";
  const parts = reason.split(" - ").map((part) => part.trim()).filter(Boolean);
  return parts[2] || "";
}
