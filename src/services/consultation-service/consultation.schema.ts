import { z } from "zod";
export const consultationCreateSchema = z.object({ doctorId: z.string().optional(), symptoms: z.string().min(5) });

