import { cookies } from "next/headers";
import { checkPassword, createSessionCookie } from "@/lib/admin-auth";
import { sameOrigin } from "@/lib/validation";

export async function POST(request: Request) {
  const back = (error?: string) =>
    Response.redirect(new URL(error ? `/admin?error=${error}` : "/admin", request.url), 303);
  if (!sameOrigin(request)) return back("origin");
  const form = await request.formData().catch(() => null);
  const password = form?.get("password");
  if (typeof password !== "string" || !(await checkPassword(password))) {
    // Slow down repeated guesses.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return back("invalid");
  }
  (await cookies()).set(await createSessionCookie());
  return back();
}
