import { NextResponse } from "next/server";
import { getSession } from "../../lib/session";
import { updatePetitionStatus } from "../../lib/users";

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      id?: string;
      status?: "open" | "granted" | "denied" | "deferred";
    };

    if (!body.id || !body.status) {
      return NextResponse.json({ error: "Petition and seal required." }, { status: 400 });
    }

    const updated = await updatePetitionStatus(session.userId, body.id, body.status);
    if (!updated) {
      return NextResponse.json({ error: "Petition not found." }, { status: 404 });
    }

    return NextResponse.json({
      petition: {
        id: updated.id,
        from: updated.from_name,
        rank: updated.rank,
        ask: updated.ask,
        status: updated.status,
      },
    });
  } catch (err) {
    console.error("petition", err);
    return NextResponse.json({ error: "Could not seal petition." }, { status: 500 });
  }
}
