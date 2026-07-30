import { NextResponse } from "next/server";
import {
  buildXAuthorizeUrl,
  createPkce,
  getAppUrl,
  getXCallbackUrl,
  getXClientId,
  getXClientSecret,
} from "../../../lib/x-oauth";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 10,
};

export async function GET(request: Request) {
  const clientId = getXClientId();
  const clientSecret = getXClientSecret();
  if (!clientId || !clientSecret) {
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") === "login" ? "login" : "signup";
    return NextResponse.redirect(
      new URL(
        `/${mode}?error=` +
          encodeURIComponent("X sign-in is not configured yet."),
        getAppUrl(request),
      ),
    );
  }

  const url = new URL(request.url);
  const holding = url.searchParams.get("holding") === "estate" ? "estate" : "fan";
  const mode = url.searchParams.get("mode") === "login" ? "login" : "signup";
  const court = (url.searchParams.get("court") || "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .slice(0, 32);

  const { verifier, challenge, state } = createPkce();
  const redirectUri = getXCallbackUrl(request);
  const authorizeUrl = buildXAuthorizeUrl({
    clientId,
    redirectUri,
    state,
    challenge,
  });

  const secure =
    process.env.NODE_ENV === "production" ||
    redirectUri.startsWith("https://");
  const cookieOpts = { ...COOKIE_OPTS, secure };

  const res = NextResponse.redirect(authorizeUrl);
  res.cookies.set("vassal_x_verifier", verifier, cookieOpts);
  res.cookies.set("vassal_x_state", state, cookieOpts);
  res.cookies.set("vassal_x_holding", court ? "fan" : holding, cookieOpts);
  res.cookies.set("vassal_x_mode", mode, cookieOpts);
  // Exact redirect_uri used at authorize time — must match on token exchange.
  res.cookies.set("vassal_x_redirect", redirectUri, cookieOpts);
  if (court) {
    res.cookies.set("vassal_x_court", court, cookieOpts);
  }
  return res;
}
