import { NextResponse } from "next/server";
import { writeSessionCookie } from "../../../../lib/session";
import { upsertUserFromX } from "../../../../lib/users";
import {
  exchangeXCode,
  fetchXProfile,
  getAppUrl,
  getXCallbackUrl,
  getXClientId,
  getXClientSecret,
} from "../../../../lib/x-oauth";

export async function GET(request: Request) {
  const appUrl = getAppUrl(request);
  const fail = (message: string) =>
    NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, appUrl),
    );

  try {
    const clientId = getXClientId();
    const clientSecret = getXClientSecret();
    if (!clientId || !clientSecret) {
      return fail("X sign-in is not configured yet.");
    }

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const oauthError = url.searchParams.get("error");
    if (oauthError) {
      return fail("X sign-in was cancelled.");
    }
    if (!code || !state) {
      return fail("Missing X authorization code.");
    }

    const cookieHeader = request.headers.get("cookie") || "";
    const jar = Object.fromEntries(
      cookieHeader
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
          const i = part.indexOf("=");
          return [part.slice(0, i), decodeURIComponent(part.slice(i + 1))];
        }),
    );

    if (!jar.vassal_x_state || jar.vassal_x_state !== state) {
      return fail("Invalid X sign-in state.");
    }
    const verifier = jar.vassal_x_verifier;
    if (!verifier) {
      return fail("X sign-in expired. Try again.");
    }

    const holding = jar.vassal_x_holding === "estate" ? "estate" : "fan";

    const accessToken = await exchangeXCode({
      code,
      redirectUri: getXCallbackUrl(request),
      verifier,
      clientId,
      clientSecret,
    });
    const profile = await fetchXProfile(accessToken);
    const user = await upsertUserFromX({
      xId: profile.id,
      username: profile.username,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      holding,
    });

    const res = NextResponse.redirect(new URL("/dashboard", appUrl));
    writeSessionCookie(res, {
      userId: user.id,
      email: user.email,
      name: user.name,
      holding: user.holding,
    });
    res.cookies.delete("vassal_x_verifier");
    res.cookies.delete("vassal_x_state");
    res.cookies.delete("vassal_x_holding");
    res.cookies.delete("vassal_x_mode");
    return res;
  } catch (err) {
    console.error("x callback", err);
    return fail("Could not finish X sign-in.");
  }
}
