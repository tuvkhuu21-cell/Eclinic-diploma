import { z } from "zod";
export const videoRequestSchema = z.object({ doctorId: z.string(), appointmentId: z.string().optional() });

