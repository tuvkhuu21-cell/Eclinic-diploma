import { NextRequest } from "next/server";
import { ApiError, errorMessage } from "@/lib/errors";
import { created, fail, ok, options } from "@/lib/response";
import { getAuthUser } from "@/lib/api-auth";
import { requireRole } from "@/lib/api-role";
import { validateBody } from "@/lib/validate";
import { createNotificationSchema } from "@/services/notification-service/notification.schema";
import { notificationService } from "@/services/notification-service/notification.service";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    return ok(await notificationService.list(user.userId));
  } catch (error) {
    if (error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 403 || error.statusCode === 404)) return ok([]);
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    requireRole(user, ["ADMIN"]);
    const input = validateBody(createNotificationSchema, await request.json());
    return created(await notificationService.create(input));
  } catch (error) {
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}
