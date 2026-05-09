import { z } from "zod";
export const sharedDoctorSearchSchema = z.object({ q: z.string().optional(), specialty: z.string().optional() });

