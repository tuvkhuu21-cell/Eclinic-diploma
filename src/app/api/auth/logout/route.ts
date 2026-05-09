import { ok, options } from "@/lib/response";

export const runtime = "nodejs";
export const OPTIONS = options;

export async function POST() {
  return ok({ loggedOut: true }, "logged out");
}

