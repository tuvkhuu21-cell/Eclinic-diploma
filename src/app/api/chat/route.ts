import { NextRequest } from "next/server";
import { ApiError, errorMessage } from "@/lib/errors";
import { created, fail, ok, options } from "@/lib/response";
import { getAuthUser } from "@/lib/api-auth";
import { validateBody } from "@/lib/validate";
import { sendMessageSchema } from "@/services/chat-service/chat.schema";
import { chatService } from "@/services/chat-service/chat.service";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const roomId = request.nextUrl.searchParams.get("roomId");
    if (roomId) return ok(await chatService.messages(roomId));
    return ok(await chatService.rooms(user.userId));
  } catch (error) {
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const input = validateBody(sendMessageSchema, await request.json());
    return created(await chatService.send(user.userId, input));
  } catch (error) {
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}

