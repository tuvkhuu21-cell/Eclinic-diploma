import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const protectedPath = request.nextUrl.pathname.startsWith("/dashboard");
  const token = request.cookies.get("mediconnect_token");
  if (protectedPath && !token) return NextResponse.redirect(new URL("/auth/login", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };

