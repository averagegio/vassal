import { NextResponse } from "next/server";
import {
  buildXAuthorizeUrl,
  createPkce,
  getAppUrl,
  getXCallbackUrl,
  getXClientId,
  getXClientSecret,
} from "../../../lib/x-oauth";

export async function GET(request: Request) {
  const clientId = getXClientId();
  const clientSecret = getXClientSecret();
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL(
        "/signup?error=" +
          encodeURIComponent("X sign-in is not configured yet."),
        getAppUrl(request),
      ),
    );
  }

  const url = new URL(request.url);
  const holding = url.searchParams.get("holding") === "estate" ? "estate" : "fan";
  const mode = url.searchParams.get("mode") === "login" ? "login" : "signup";

  const { verifier, challenge, state } = createPkce();
  const redirectUri = getXCallbackUrl(request);
  const authorizeUrl = buildXAuthorizeUrl({
    clientId,
    redirectUri,
    state,
    challenge,
  });

  const res = NextResponse.redirect(authorizeUrl);
  const secure = process.env.NODE_ENV === "production";
  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: 60 * 10,
  };
  res.cookies.set("vassal_x_verifier", verifier, cookieOpts);
  res.cookies.set("vassal_x_state", state, cookieOpts);
  res.cookies.set("vassal_x_holding", holding, cookieOpts);
  res.cookies.set("vassal_x_mode", mode, cookieOpts);
  return res;
}
