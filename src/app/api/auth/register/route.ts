import { NextRequest } from "next/server";
import { ApiError, errorMessage } from "@/lib/errors";
import { created, fail, options } from "@/lib/response";
import { validateBody } from "@/lib/validate";
import { registerSchema } from "@/services/auth-service/auth.schema";
import { authService } from "@/services/auth-service/auth.service";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function POST(request: NextRequest) {
  try {
    const input = validateBody(registerSchema, await request.json());
    const data = await authService.register(input);
    return created(data, "registered");
  } catch (error) {
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}

