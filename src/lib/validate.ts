import type { ZodSchema } from "zod";
import { ApiError } from "@/lib/errors";

export function validateBody<T>(schema: ZodSchema<T>, body: unknown) {
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ApiError(400, "Validation error");
  return parsed.data;
}

