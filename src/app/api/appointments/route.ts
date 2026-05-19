import { NextRequest } from "next/server";
import { ApiError, errorMessage } from "@/lib/errors";
import { created, fail, ok, options } from "@/lib/response";
import { getAuthUser } from "@/lib/api-auth";
import { requireRole } from "@/lib/api-role";
import { validateBody } from "@/lib/validate";
import { createAppointmentSchema } from "@/services/appointment-service/appointment.schema";
import { appointmentService } from "@/services/appointment-service/appointment.service";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    return ok(await appointmentService.list(user.userId));
  } catch (error) {
    if (error instanceof ApiError) return fail(error.message, error.statusCode);
    console.error("GET /api/appointments failed", error);
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    requireRole(user, ["PATIENT"]);
    const input = validateBody(createAppointmentSchema, await request.json());
    return created(await appointmentService.create(user.userId, input));
  } catch (error) {
    if (error instanceof ApiError) return fail(error.message, error.statusCode);
    console.error("POST /api/appointments failed", error);
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}
