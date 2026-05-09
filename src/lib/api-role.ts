import { ApiError } from "@/lib/errors";
import type { AuthRole, JwtPayload } from "@/lib/jwt";

export function requireRole(user: JwtPayload, roles: AuthRole[]) {
  if (!roles.includes(user.role)) throw new ApiError(403, "Permission denied");
}

