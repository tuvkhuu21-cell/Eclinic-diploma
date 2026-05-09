import { fail, ok, options } from "@/lib/response";
import { errorMessage } from "@/lib/errors";
import { hospitalService } from "@/services/hospital-service/hospital.service";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return ok(await hospitalService.detail(id));
  } catch (error) {
    return fail(errorMessage(error), 500);
  }
}

