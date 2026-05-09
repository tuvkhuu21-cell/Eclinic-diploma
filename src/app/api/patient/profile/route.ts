import { NextRequest } from "next/server";
import { ApiError, errorMessage } from "@/lib/errors";
import { fail, ok, options } from "@/lib/response";
import { getAuthUser } from "@/lib/api-auth";
import { requireRole } from "@/lib/api-role";
import { validateBody } from "@/lib/validate";
import { patientProfileSchema } from "@/services/patient-service/patient.schema";
import { patientService } from "@/services/patient-service/patient.service";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    requireRole(user, ["PATIENT", "DOCTOR", "ADMIN"]);
    return ok(await patientService.getProfile(user.userId, user.role, request.nextUrl.searchParams));
  } catch (error) {
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    requireRole(user, ["PATIENT"]);
    const input = validateBody(patientProfileSchema, await request.json());
    return ok(await patientService.updateProfile(user.userId, input), "updated");
  } catch (error) {
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}

