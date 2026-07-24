import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { resolveDatabaseUrl } from "./db";

const COOKIE = "vassal_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  holding: "fan" | "estate";
};

/** Prefer SESSION_SECRET; otherwise derive a stable secret from the Neon URL. */
function secret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const url = resolveDatabaseUrl();
  if (!url) {
    throw new Error("SESSION_SECRET or Neon DATABASE_URL is required");
  }
  return createHmac("sha256", "vassal.session.v1").update(url).digest("hex");
}

function sign(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token: string): SessionPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSession(payload: SessionPayload) {
  const jar = await cookies();
  jar.set(COOKIE, sign(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return verify(token);
}
