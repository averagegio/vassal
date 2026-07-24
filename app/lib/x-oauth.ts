import { createHash, randomBytes } from "crypto";

export function getXClientId() {
  return process.env.X_CLIENT_ID || process.env.TWITTER_CLIENT_ID || "";
}

export function getXClientSecret() {
  return process.env.X_CLIENT_SECRET || process.env.TWITTER_CLIENT_SECRET || "";
}

export function getAppUrl(request: Request) {
  const envUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (envUrl) return envUrl.replace(/\/$/, "");
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export function getXCallbackUrl(request: Request) {
  return `${getAppUrl(request)}/api/auth/x/callback`;
}

export function createPkce() {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const state = randomBytes(16).toString("base64url");
  return { verifier, challenge, state };
}

export function buildXAuthorizeUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
  challenge: string;
}) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    scope: "users.read tweet.read offline.access",
    state: input.state,
    code_challenge: input.challenge,
    code_challenge_method: "S256",
  });
  return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
}

export async function exchangeXCode(input: {
  code: string;
  redirectUri: string;
  verifier: string;
  clientId: string;
  clientSecret: string;
}) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.redirectUri,
    code_verifier: input.verifier,
    client_id: input.clientId,
  });

  const basic = Buffer.from(
    `${input.clientId}:${input.clientSecret}`,
  ).toString("base64");

  const res = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body,
  });

  const data = (await res.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "X token exchange failed");
  }
  return data.access_token;
}

export async function fetchXProfile(accessToken: string) {
  const res = await fetch(
    "https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  const data = (await res.json()) as {
    data?: {
      id: string;
      name: string;
      username: string;
      profile_image_url?: string;
    };
    detail?: string;
    title?: string;
  };
  if (!res.ok || !data.data) {
    throw new Error(data.detail || data.title || "Could not load X profile");
  }
  const avatar = data.data.profile_image_url?.replace("_normal", "_400x400") ?? null;
  return {
    id: data.data.id,
    name: data.data.name,
    username: data.data.username,
    avatarUrl: avatar,
  };
}
