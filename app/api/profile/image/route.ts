import { NextResponse } from "next/server";
import { getSession } from "../../../lib/session";
import { updateProfileImage } from "../../../lib/users";

const MAX_CHARS = 900_000; // ~675KB binary after base64

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      kind?: "avatar" | "header";
      dataUrl?: string | null;
    };

    if (body.kind !== "avatar" && body.kind !== "header") {
      return NextResponse.json({ error: "Choose avatar or header." }, { status: 400 });
    }

    const dataUrl = body.dataUrl ?? null;
    if (dataUrl) {
      if (!dataUrl.startsWith("data:image/")) {
        return NextResponse.json({ error: "Image required." }, { status: 400 });
      }
      if (dataUrl.length > MAX_CHARS) {
        return NextResponse.json({ error: "Image too large." }, { status: 400 });
      }
    }

    const user = await updateProfileImage(session.userId, body.kind, dataUrl);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        holding: user.holding,
        xUsername: user.x_username,
        avatarUrl: user.avatar_url,
        headerUrl: user.header_url,
      },
    });
  } catch (err) {
    console.error("profile image", err);
    return NextResponse.json({ error: "Could not save image." }, { status: 500 });
  }
}
