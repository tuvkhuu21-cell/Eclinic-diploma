import { z } from "zod";
export const labLookupSchema = z.object({ code: z.string().min(4) });

