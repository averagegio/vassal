import { NextResponse } from "next/server";
import { getCourtBySlug, getMembershipForUser } from "../../lib/courts";
import { findUserByHandle } from "../../lib/follows";
import { RANK_LABEL, type CourtRank } from "../../lib/ranks";
import { getSession } from "../../lib/session";
import { createPetition, findUserById, updatePetitionStatus } from "../../lib/users";

function petitionJson(row: {
  id: string;
  from_name: string;
  rank: string;
  ask: string;
  status: string;
}) {
  return {
    id: row.id,
    from: row.from_name,
    rank: row.rank,
    ask: row.ask,
    status: row.status,
  };
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      ask?: string;
      courtSlug?: string;
      toHandle?: string;
    };

    const ask = body.ask?.trim() ?? "";
    if (!ask) {
      return NextResponse.json({ error: "Write your ask." }, { status: 400 });
    }
    if (ask.length > 500) {
      return NextResponse.json(
        { error: "Keep petitions under 500 characters." },
        { status: 400 },
      );
    }

    const petitioner = await findUserById(session.userId);
    if (!petitioner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let ownerUserId: string | null = null;
    let rankLabel = "Tenant";

    const courtSlug = body.courtSlug?.trim();
    const toHandle = body.toHandle?.trim();

    if (courtSlug) {
      const court = await getCourtBySlug(courtSlug);
      if (!court) {
        return NextResponse.json({ error: "Court not found." }, { status: 404 });
      }
      const membership = await getMembershipForUser(session.userId);
      if (!membership || membership.court_id !== court.id) {
        return NextResponse.json(
          { error: "Swear fealty before petitioning this court." },
          { status: 403 },
        );
      }
      if (membership.role === "lord") {
        return NextResponse.json(
          { error: "Lords seal petitions — they do not file them here." },
          { status: 400 },
        );
      }
      ownerUserId = court.lord_user_id;
      rankLabel =
        RANK_LABEL[(membership.rank as CourtRank) || "serf"] || membership.rank;
    } else if (toHandle) {
      const target = await findUserByHandle(toHandle);
      if (!target) {
        return NextResponse.json({ error: "Holding not found." }, { status: 404 });
      }
      if (target.id === session.userId) {
        return NextResponse.json(
          { error: "You cannot petition yourself." },
          { status: 400 },
        );
      }
      ownerUserId = target.id;
      const membership = await getMembershipForUser(session.userId);
      if (
        membership &&
        membership.lord_user_id === target.id &&
        membership.role === "vassal"
      ) {
        rankLabel =
          RANK_LABEL[(membership.rank as CourtRank) || "serf"] ||
          membership.rank;
      } else {
        rankLabel = petitioner.holding === "estate" ? "Tenant" : "Supplicant";
      }
    } else {
      const membership = await getMembershipForUser(session.userId);
      if (!membership || membership.role !== "vassal") {
        return NextResponse.json(
          {
            error:
              "Join a court as a vassal, or petition a holding from their profile.",
          },
          { status: 400 },
        );
      }
      ownerUserId = membership.lord_user_id;
      rankLabel =
        RANK_LABEL[(membership.rank as CourtRank) || "serf"] || membership.rank;
    }

    if (!ownerUserId) {
      return NextResponse.json({ error: "No holding to petition." }, { status: 400 });
    }

    const created = await createPetition({
      ownerUserId,
      fromName: petitioner.name,
      rank: rankLabel,
      ask,
    });

    return NextResponse.json({ petition: petitionJson(created) }, { status: 201 });
  } catch (err) {
    console.error("petition create", err);
    return NextResponse.json({ error: "Could not file petition." }, { status: 500 });
  }
}

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

    return NextResponse.json({ petition: petitionJson(updated) });
  } catch (err) {
    console.error("petition", err);
    return NextResponse.json({ error: "Could not seal petition." }, { status: 500 });
  }
}
