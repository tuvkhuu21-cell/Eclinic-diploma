import { z } from "zod";
export const videoRequestSchema = z.object({ doctorId: z.string(), appointmentId: z.string().optional() });
export const videoStatusSchema = z.object({
  roomId: z.string(),
  status: z.enum(["waiting", "ringing", "active", "declined", "ended"]).default("ended"),
});
