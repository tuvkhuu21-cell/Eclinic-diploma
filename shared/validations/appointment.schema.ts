import { z } from "zod";
export const sharedAppointmentSchema = z.object({ doctorId: z.string(), hospitalId: z.string().optional(), scheduledAt: z.string().datetime(), reason: z.string().min(3) });

