import { NextRequest } from "next/server";
import { ApiError, errorMessage } from "@/lib/errors";
import { fail, ok, options } from "@/lib/response";
import { validateBody } from "@/lib/validate";
import { loginSchema } from "@/services/auth-service/auth.schema";
import { authService } from "@/services/auth-service/auth.service";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function POST(request: NextRequest) {
  try {
    const input = validateBody(loginSchema, await request.json());
    const data = await authService.login(input);
    return ok(data, "logged in");
  } catch (error) {
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}

