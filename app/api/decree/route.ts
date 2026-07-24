import { NextResponse } from "next/server";
import { getSession } from "../../lib/session";
import { updateDecree } from "../../lib/users";

export async function PATCH(request: Request) {
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

    await updateDecree(session.userId, decree);
    return NextResponse.json({ decree });
  } catch (err) {
    console.error("decree", err);
    return NextResponse.json({ error: "Could not save decree." }, { status: 500 });
  }
}
