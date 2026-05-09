import { NextRequest } from "next/server";
import { ApiError, errorMessage } from "@/lib/errors";
import { created, fail, options } from "@/lib/response";
import { getAuthUser } from "@/lib/api-auth";
import { requireRole } from "@/lib/api-role";
import { validateBody } from "@/lib/validate";
import { videoRequestSchema } from "@/services/video-call-service/video.schema";
import { videoService } from "@/services/video-call-service/video.service";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    requireRole(user, ["PATIENT"]);
    const input = validateBody(videoRequestSchema, await request.json());
    return created(await videoService.request(user.userId, input));
  } catch (error) {
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}

