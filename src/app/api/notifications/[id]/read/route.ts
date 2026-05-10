import { NextRequest } from "next/server";
import { ApiError, errorMessage } from "@/lib/errors";
import { getAuthUser } from "@/lib/api-auth";
import { fail, ok, options } from "@/lib/response";
import { notificationService } from "@/services/notification-service/notification.service";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(_request);
    const { id } = await params;
    return ok(await notificationService.markRead(id, user.userId));
  } catch (error) {
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}
