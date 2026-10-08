import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { sameOrigin } from "@/lib/validation";

export async function POST(request: Request) {
  if (sameOrigin(request)) (await cookies()).delete(ADMIN_COOKIE);
  return Response.redirect(new URL("/admin", request.url), 303);
}
