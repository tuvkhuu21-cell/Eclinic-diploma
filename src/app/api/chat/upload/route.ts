import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { ApiError, errorMessage } from "@/lib/errors";
import { getAuthUser } from "@/lib/api-auth";
import { fail, ok, options } from "@/lib/response";

export const runtime = "nodejs";
export const OPTIONS = options;

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf", ".doc", ".docx"]);

export async function POST(request: NextRequest) {
  try {
    getAuthUser(request);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError(400, "file is required");
    const extension = path.extname(file.name).toLowerCase();
    if (!allowedMimeTypes.has(file.type) || !allowedExtensions.has(extension)) {
      throw new ApiError(400, "Unsupported file type");
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.byteLength > 8 * 1024 * 1024) throw new ApiError(400, "File is too large");

    const uploadDir = path.join(process.cwd(), "public", "uploads", "chat");
    await mkdir(uploadDir, { recursive: true });
    const safeName = `${randomUUID()}${extension}`;
    await writeFile(path.join(uploadDir, safeName), bytes);
    return ok({
      url: `/uploads/chat/${safeName}`,
      name: file.name,
      mimeType: file.type,
      size: bytes.byteLength,
    });
  } catch (error) {
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}
