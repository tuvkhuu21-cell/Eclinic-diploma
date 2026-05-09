import { NextRequest } from "next/server";
import { fail, ok, options } from "@/lib/response";
import { errorMessage } from "@/lib/errors";
import { doctorService } from "@/services/doctor-service/doctor.service";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function GET(request: NextRequest) {
  try {
    return ok(await doctorService.list({ q: request.nextUrl.searchParams.get("q"), specialty: request.nextUrl.searchParams.get("specialty") }));
  } catch (error) {
    return fail(errorMessage(error), 500);
  }
}

