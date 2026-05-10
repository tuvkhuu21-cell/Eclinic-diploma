import { NextRequest } from "next/server";
import { ApiError, errorMessage } from "@/lib/errors";
import { fail, ok, options } from "@/lib/response";
import { getAuthUser } from "@/lib/api-auth";
import { requireRole } from "@/lib/api-role";
import { validateBody } from "@/lib/validate";
import { doctorProfileUpdateSchema } from "@/services/doctor-service/doctor.schema";
import { doctorService } from "@/services/doctor-service/doctor.service";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    requireRole(user, ["DOCTOR"]);
    return ok(await doctorService.me(user.userId));
  } catch (error) {
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    requireRole(user, ["DOCTOR"]);
    const input = validateBody(doctorProfileUpdateSchema, await request.json());
    return ok(await doctorService.updateMe(user.userId, input), "updated");
  } catch (error) {
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}
