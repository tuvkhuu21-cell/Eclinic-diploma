import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import type { AuthRole } from "@/lib/jwt";
import type { z } from "zod";
import type { patientHealthSchema, patientProfileSchema } from "./patient.schema";

type ProfileInput = z.infer<typeof patientProfileSchema>;
type HealthInput = z.infer<typeof patientHealthSchema>;

const profileInclude = { user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } } };

async function resolvePatient(userId: string, role: AuthRole, query: URLSearchParams) {
  if (role === "PATIENT") {
    const profile = await prisma.patientProfile.findUnique({ where: { userId }, include: profileInclude });
    if (!profile) throw new ApiError(404, "Patient profile not found");
    return profile;
  }

  const patientId = query.get("patientId");
  const email = query.get("email");
  const roomId = query.get("roomId");

  if (patientId) {
    const profile = await prisma.patientProfile.findUnique({ where: { id: patientId }, include: profileInclude });
    if (!profile) throw new ApiError(404, "Patient profile not found");
    return profile;
  }

  if (email) {
    const profile = await prisma.patientProfile.findFirst({ where: { user: { email } }, include: profileInclude });
    if (!profile) throw new ApiError(404, "Patient profile not found");
    return profile;
  }

  if (roomId) {
    const room = await prisma.chatRoom.findUnique({ where: { id: roomId }, include: { patient: { include: profileInclude } } });
    if (!room) throw new ApiError(404, "Chat room not found");
    return room.patient;
  }

  throw new ApiError(400, "Patient selector required");
}

export const patientService = {
  async getProfile(userId: string, role: AuthRole, query: URLSearchParams) {
    return resolvePatient(userId, role, query);
  },
  async updateProfile(userId: string, input: ProfileInput) {
    const profile = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!profile) throw new ApiError(404, "Patient profile not found");
    const dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : undefined;
    return prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          firstName: input.firstName || undefined,
          lastName: input.lastName || undefined,
          phone: input.phone || undefined,
          email: input.email || undefined,
        },
      });
      return tx.patientProfile.update({
        where: { userId },
        data: {
          registerNo: input.registerNo,
          gender: input.gender,
          dateOfBirth,
          bloodType: input.bloodType,
          maritalStatus: input.maritalStatus,
          heightCm: input.heightCm,
          weightKg: input.weightKg,
          bmi: input.bmi,
          city: input.city,
          district: input.district,
          khoroo: input.khoroo,
          addressDetail: input.addressDetail,
          emergencyRelation: input.emergencyRelation,
          emergencyName: input.emergencyName,
          emergencyPhone: input.emergencyPhone,
        },
        include: profileInclude,
      });
    });
  },
  async getHealth(userId: string, role: AuthRole, query: URLSearchParams) {
    return resolvePatient(userId, role, query);
  },
  async updateHealth(userId: string, input: HealthInput) {
    const profile = await prisma.patientProfile.findUnique({ where: { userId } });
    if (!profile) throw new ApiError(404, "Patient profile not found");
    return prisma.patientProfile.update({
      where: { userId },
      data: input,
      include: profileInclude,
    });
  },
};

