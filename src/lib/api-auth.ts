import type { NextRequest } from "next/server";
import { ApiError } from "@/lib/errors";
import { verifyJwt, type JwtPayload } from "@/lib/jwt";

export function getAuthUser(request: NextRequest): JwtPayload {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : request.cookies.get("mediconnect_token")?.value;
  if (!token) throw new ApiError(401, "Authentication required");
  try {
    return verifyJwt(token);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
}

