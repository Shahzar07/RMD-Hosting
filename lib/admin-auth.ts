import { cookies } from "next/headers";

// Admin sign-in is a single password stored in the ADMIN_PASSWORD environment
// variable. A signed, HTTP-only cookie keeps the session for 7 days.
export const ADMIN_COOKIE = "rmd_admin";
const SESSION_SECONDS = 60 * 60 * 24 * 7;
const encoder = new TextEncoder();

function secret() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return (process.env.ADMIN_SESSION_SECRET ?? "") + ":" + password;
}

async function sign(value: string, key: string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(value));
  return Buffer.from(signature).toString("base64url");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function adminConfigured() {
  return !!process.env.ADMIN_PASSWORD;
}

export async function checkPassword(candidate: string) {
  const key = secret();
  if (!key) return false;
  // Compare HMACs so the comparison is constant-length.
  const [a, b] = await Promise.all([
    sign(candidate, key),
    sign(process.env.ADMIN_PASSWORD as string, key),
  ]);
  return safeEqual(a, b);
}

export async function createSessionCookie() {
  const key = secret();
  if (!key) throw new Error("ADMIN_PASSWORD is not set.");
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  return {
    name: ADMIN_COOKIE,
    value: `${expires}.${await sign(String(expires), key)}`,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_SECONDS,
  };
}

export async function hasAdminSession() {
  const key = secret();
  if (!key) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < Date.now() / 1000) return false;
  return safeEqual(signature, await sign(expires, key));
}
