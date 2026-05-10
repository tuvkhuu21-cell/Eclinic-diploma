import { NextRequest } from "next/server";
import { ApiError, errorMessage } from "@/lib/errors";
import { created, fail, options } from "@/lib/response";
import { validateBody } from "@/lib/validate";
import { doctorRegisterSchema } from "@/services/doctor-service/doctor.schema";
import { doctorService } from "@/services/doctor-service/doctor.service";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function POST(request: NextRequest) {
  try {
    const input = validateBody(doctorRegisterSchema, await request.json());
    return created(await doctorService.register(input), "registered");
  } catch (error) {
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}
