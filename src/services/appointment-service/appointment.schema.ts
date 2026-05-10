import { z } from "zod";

export const createAppointmentSchema = z.object({
  doctorId: z.string(),
  hospitalId: z.string().optional(),
  scheduledAt: z.string().datetime(),
  reason: z.string().min(3),
  durationMinutes: z.coerce.number().optional(),
  type: z.string().optional(),
  price: z.coerce.number().optional(),
  paymentStatus: z.string().optional(),
});

export const mockPaymentSchema = z.object({
  doctorId: z.string(),
  scheduledAt: z.string().datetime(),
  paymentStatus: z.string().default("PAID"),
  type: z.string().optional(),
  price: z.coerce.number().optional(),
});
