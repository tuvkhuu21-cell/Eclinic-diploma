import { z } from "zod";
export const createNotificationSchema = z.object({ userId: z.string(), title: z.string(), body: z.string().optional(), type: z.string().default("SYSTEM") });

