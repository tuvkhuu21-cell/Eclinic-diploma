import { z } from "zod";
export const aiAskSchema = z.object({ message: z.string().min(2), tool: z.string().optional(), context: z.record(z.unknown()).optional() });

