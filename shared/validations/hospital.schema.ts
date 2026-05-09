import { z } from "zod";
export const sharedHospitalSearchSchema = z.object({ q: z.string().optional(), district: z.string().optional() });

