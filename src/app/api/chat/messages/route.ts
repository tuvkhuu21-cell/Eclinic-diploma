import { NextRequest } from "next/server";
import { ApiError, errorMessage } from "@/lib/errors";
import { created, fail, options } from "@/lib/response";
import { getAuthUser } from "@/lib/api-auth";
import { validateBody } from "@/lib/validate";
import { sendMessageSchema } from "@/services/chat-service/chat.schema";
import { chatService } from "@/services/chat-service/chat.service";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const user = getAuthUser(request);
    const authedAt = Date.now();
    const input = validateBody(sendMessageSchema, await request.json());
    const message = await chatService.send(user.userId, input);
    const totalMs = Date.now() - startedAt;
    if (totalMs > 600) console.info("POST /api/chat/messages slow", { totalMs, authMs: authedAt - startedAt });
    return created(message);
  } catch (error) {
    if (error instanceof ApiError) return fail(error.message, error.statusCode);
    console.error("POST /api/chat/messages failed", error);
    return fail(errorMessage(error), 500);
  }
}
