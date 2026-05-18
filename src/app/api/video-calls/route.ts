import { NextRequest } from "next/server";
import { ApiError, errorMessage } from "@/lib/errors";
import { created, fail, ok, options } from "@/lib/response";
import { getAuthUser } from "@/lib/api-auth";
import { validateBody } from "@/lib/validate";
import { videoRequestSchema, videoStatusSchema } from "@/services/video-call-service/video.schema";
import { videoService } from "@/services/video-call-service/video.service";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const status = request.nextUrl.searchParams.get("status");
    if (status === "ringing") return ok(await videoService.incoming(user.userId));
    return ok([]);
  } catch (error) {
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const input = validateBody(videoRequestSchema, await request.json());
    return created(await videoService.request(user.userId, input));
  } catch (error) {
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const input = validateBody(videoStatusSchema, await request.json());
    return ok(await videoService.updateStatus(user.userId, input.roomId, input.status || "ended"));
  } catch (error) {
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}
