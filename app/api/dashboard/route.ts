import { NextResponse } from "next/server";
import { getSession } from "../../lib/session";
import {
  getDashboardStats,
  getUserDecree,
  listPetitions,
  listTenants,
} from "../../lib/users";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [stats, petitions, tenants, decree] = await Promise.all([
      getDashboardStats(session.userId),
      listPetitions(session.userId),
      listTenants(session.userId),
      getUserDecree(session.userId),
    ]);

    return NextResponse.json({
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        holding: session.holding,
      },
      stats,
      decree,
      petitions: petitions.map((p) => ({
        id: p.id,
        from: p.from_name,
        rank: p.rank,
        ask: p.ask,
        status: p.status,
      })),
      tenants: tenants.map((t) => ({
        id: t.id,
        name: t.name,
        rank: t.rank,
        standing: t.standing,
        status: t.status,
      })),
    });
  } catch (err) {
    console.error("dashboard", err);
    return NextResponse.json({ error: "Could not load holding." }, { status: 500 });
  }
}
