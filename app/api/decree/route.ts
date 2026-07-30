import { NextResponse } from "next/server";
import { getSession } from "../../lib/session";
import { listDecrees, publishDecree } from "../../lib/users";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decrees = await listDecrees(session.userId);
    return NextResponse.json({
      decrees: decrees.map((d) => ({
        id: d.id,
        body: d.body,
        createdAt: d.created_at,
      })),
    });
  } catch (err) {
    console.error("decree list", err);
    return NextResponse.json({ error: "Could not load decrees." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { decree?: string };
    const decree = body.decree?.trim() ?? "";
    if (!decree) {
      return NextResponse.json({ error: "Decree required." }, { status: 400 });
    }

    const posted = await publishDecree(session.userId, decree);
    return NextResponse.json({
      decree: posted.body,
      post: {
        id: posted.id,
        body: posted.body,
        createdAt: posted.created_at,
      },
    });
  } catch (err) {
    console.error("decree", err);
    return NextResponse.json({ error: "Could not post decree." }, { status: 500 });
  }
}

/** @deprecated Prefer POST — kept so older clients still publish to the feed. */
export async function PATCH(request: Request) {
  return POST(request);
}
