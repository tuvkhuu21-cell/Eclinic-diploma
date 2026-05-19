import { fail, ok, options } from "@/lib/response";
import { ApiError, errorMessage } from "@/lib/errors";
import { doctorService } from "@/services/doctor-service/doctor.service";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doctor = await doctorService.detail(id);
    if (!doctor) return fail("Doctor not found", 404);
    return ok(doctor);
  } catch (error) {
    if (error instanceof ApiError) return fail(error.message, error.statusCode);
    console.error("GET /api/doctors/[id] failed", error);
    return fail(errorMessage(error), 500);
  }
}
