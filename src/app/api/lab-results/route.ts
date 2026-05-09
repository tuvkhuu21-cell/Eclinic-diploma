import { NextRequest } from "next/server";
import { ApiError, errorMessage } from "@/lib/errors";
import { fail, ok, options } from "@/lib/response";
import { validateBody } from "@/lib/validate";
import { labLookupSchema } from "@/services/lab-result-service/lab.schema";
import { labService } from "@/services/lab-result-service/lab.service";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function POST(request: NextRequest) {
  try {
    const input = validateBody(labLookupSchema, await request.json());
    return ok(await labService.lookup(input.code));
  } catch (error) {
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}

