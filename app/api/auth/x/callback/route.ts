import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { joinCourt } from "../../../../lib/courts";
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

function clearXCookies(res: NextResponse) {
  const names = [
    "vassal_x_verifier",
    "vassal_x_state",
    "vassal_x_holding",
    "vassal_x_mode",
    "vassal_x_redirect",
    "vassal_x_court",
  ];
  for (const name of names) {
    res.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
}

export async function GET(request: Request) {
  const appUrl = getAppUrl(request);
  const fail = (message: string) => {
    const res = NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, appUrl),
    );
    clearXCookies(res);
    return res;
  };

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

    const jar = await cookies();
    const savedState = jar.get("vassal_x_state")?.value;
    const verifier = jar.get("vassal_x_verifier")?.value;
    const courtSlug = jar.get("vassal_x_court")?.value || "";
    const holding =
      courtSlug || jar.get("vassal_x_holding")?.value !== "estate"
        ? "fan"
        : "estate";
    const redirectUri =
      jar.get("vassal_x_redirect")?.value || getXCallbackUrl(request);

    if (!savedState || savedState !== state) {
      return fail("Invalid X sign-in state. Try again.");
    }
    if (!verifier) {
      return fail("X sign-in expired. Try again.");
    }

    const accessToken = await exchangeXCode({
      code,
      redirectUri,
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

    let nextPath = "/dashboard";
    if (courtSlug) {
      try {
        const { court } = await joinCourt({
          userId: user.id,
          slug: courtSlug,
        });
        nextPath = `/hall/${encodeURIComponent(court.slug)}`;
      } catch {
        nextPath = `/dashboard?courtError=${encodeURIComponent(
          "Signed in, but could not swear fealty to that court.",
        )}`;
      }
    }

    const res = NextResponse.redirect(new URL(nextPath, appUrl));
    writeSessionCookie(res, {
      userId: user.id,
      email: user.email,
      name: user.name,
      holding: user.holding,
    });
    clearXCookies(res);
    return res;
  } catch (err) {
    console.error("x callback", err);
    const detail =
      err instanceof Error && err.message
        ? err.message
        : "Could not finish X sign-in.";
    const message =
      detail.length > 120 ? "Could not finish X sign-in." : detail;
    return fail(message);
  }
}
