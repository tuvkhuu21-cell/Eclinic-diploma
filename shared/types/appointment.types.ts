export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type AppointmentDto = { id: string; patientId: string; doctorId: string; hospitalId?: string; scheduledAt: string; reason: string; status: AppointmentStatus };

