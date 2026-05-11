import { NextRequest } from "next/server";
import { ApiError, errorMessage } from "@/lib/errors";
import { fail, ok, options } from "@/lib/response";
import { getAuthUser } from "@/lib/api-auth";
import { videoService } from "@/services/video-call-service/video.service";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function GET(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const user = getAuthUser(request);
    const { roomId } = await params;
    return ok(await videoService.getByRoom(user.userId, roomId));
  } catch (error) {
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}
