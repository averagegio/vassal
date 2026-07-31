import { NextResponse } from "next/server";
import { getAppViewer } from "../../../lib/viewer";
import { getSession, touchSession } from "../../../lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Keep the cookie alive for as long as the member keeps using the realm.
  await touchSession(session);

  const viewer = await getAppViewer();
  if (!viewer) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: viewer.id,
      name: viewer.name,
      email: viewer.email,
      holding: viewer.holding,
      avatarUrl: viewer.avatarUrl,
      court: viewer.court,
      homeHref: viewer.homeHref,
    },
  });
}
