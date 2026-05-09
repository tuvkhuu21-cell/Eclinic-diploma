import { z } from "zod";
export const sendMessageSchema = z.object({ roomId: z.string(), content: z.string().min(1) });

