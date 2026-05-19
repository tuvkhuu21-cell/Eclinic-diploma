import { ApiError, errorMessage } from "@/lib/errors";
import { getAuthUser } from "@/lib/api-auth";
import { requireRole } from "@/lib/api-role";
import { prisma } from "@/lib/prisma";
import { fail, ok, options } from "@/lib/response";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    requireRole(user, ["PATIENT"]);
    const patient = await prisma.patientProfile.findUnique({ where: { userId: user.userId } });
    if (!patient) throw new ApiError(403, "Patient profile required");
    const results = await prisma.labResult.findMany({
      where: { patientId: patient.id },
      select: { id: true, code: true, title: true, resultJson: true, summary: true, issuedAt: true },
      orderBy: { issuedAt: "desc" },
      take: 50,
    });
    return ok(results.map((result) => {
      const meta = normalizeMeta(result.resultJson);
      return {
        id: result.id,
        code: result.code,
        title: result.title,
        issuedAt: result.issuedAt,
        summary: result.summary || meta.doctorNote || "",
        labName: meta.labName || "MediConnect лаборатори",
        status: meta.status || "Бэлэн",
        sourceType: meta.sourceType || inferSourceType(meta.labName || ""),
        doctorNote: meta.doctorNote || result.summary || "",
        values: Array.isArray((result.resultJson as { values?: unknown }).values) ? (result.resultJson as { values: unknown[] }).values : [],
        fileUrl: meta.fileUrl || "",
        fileName: meta.fileName || `${result.code}.pdf`,
      };
    }));
  } catch (error) {
    if (error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 403 || error.statusCode === 404)) return ok([]);
    console.error("GET /api/lab-results/my failed", error);
    return fail(errorMessage(error), error instanceof ApiError ? error.statusCode : 500);
  }
}

function normalizeMeta(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Partial<Record<"labName" | "status" | "sourceType" | "doctorNote" | "fileUrl" | "fileName", string>>;
}

function inferSourceType(labName: string) {
  return /улсын|халдварт|үндэсний/i.test(labName) ? "state" : "private";
}
