import { NextRequest } from "next/server";
import { ApiError, errorMessage } from "@/lib/errors";
import { fail, ok, options } from "@/lib/response";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const doctorId = request.nextUrl.searchParams.get("doctorId") || request.nextUrl.searchParams.get("service") || "";
    const start = request.nextUrl.searchParams.get("start") || "";
    const end = request.nextUrl.searchParams.get("end") || "";
    if (!doctorId) throw new ApiError(400, "doctorId is required");

    const startDate = start ? new Date(`${start}T00:00:00`) : new Date();
    const endDate = end ? new Date(`${end}T23:59:59.999`) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) throw new ApiError(400, "Invalid date range");

    const rows = await prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledAt: { gte: startDate, lte: endDate },
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      },
      select: { id: true, scheduledAt: true, status: true, paymentStatus: true },
      orderBy: { scheduledAt: "asc" },
      take: 300,
    });
    const totalMs = Date.now() - startedAt;
    if (totalMs > 600) console.info("GET /api/appointments/availability slow", { totalMs, count: rows.length });
    return ok(rows.map((row) => ({
      id: row.id,
      scheduledAt: row.scheduledAt,
      status: row.status,
      paymentStatus: row.paymentStatus,
    })));
  } catch (error) {
    if (error instanceof ApiError) return fail(error.message, error.statusCode);
    console.error("GET /api/appointments/availability failed", error);
    return fail(errorMessage(error), 500);
  }
}
