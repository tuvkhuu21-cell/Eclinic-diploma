import { prisma } from "@/lib/prisma";
export const adminService = { async stats() { const [users, doctors, hospitals, appointments] = await Promise.all([prisma.user.count(), prisma.doctorProfile.count(), prisma.hospital.count(), prisma.appointment.count()]); return { users, doctors, hospitals, appointments }; } };

