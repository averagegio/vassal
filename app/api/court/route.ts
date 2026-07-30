import { NextResponse } from "next/server";
import {
  createCourt,
  getMembershipForUser,
  joinCourt,
} from "../../lib/courts";
import type { HallTheme, HallWidget } from "../../lib/ranks";
import { HALL_THEMES, HALL_WIDGETS } from "../../lib/ranks";
import { getSession } from "../../lib/session";
import { findUserById } from "../../lib/users";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const membership = await getMembershipForUser(session.userId);
    if (!membership) {
      return NextResponse.json({ membership: null });
    }
    return NextResponse.json({
      membership: {
        courtId: membership.court_id,
        slug: membership.court_slug,
        name: membership.court_name,
        rank: membership.rank,
        standing: membership.standing,
        role: membership.role,
      },
    });
  } catch (err) {
    console.error("court get", err);
    return NextResponse.json({ error: "Could not load court." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      action?: "create" | "join";
      name?: string;
      slug?: string;
      theme?: HallTheme;
      widget?: HallWidget;
      tagline?: string;
    };

    const action = body.action === "join" ? "join" : "create";

    if (action === "join") {
      const slug = body.slug?.trim() ?? "";
      if (!slug) {
        return NextResponse.json({ error: "Court slug required." }, { status: 400 });
      }
      try {
        const { court, member } = await joinCourt({
          userId: session.userId,
          slug,
        });
        return NextResponse.json({
          court: {
            id: court.id,
            slug: court.slug,
            name: court.name,
            theme: court.theme,
            widget: court.widget,
          },
          member: {
            rank: member.rank,
            standing: member.standing,
            role: member.role,
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not join.";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    const user = await findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.holding !== "fan") {
      return NextResponse.json(
        { error: "Fan Court holding required to open a hall." },
        { status: 400 },
      );
    }

    const name = body.name?.trim() || `${user.name}'s Court`;
    const theme = HALL_THEMES.includes(body.theme as HallTheme)
      ? (body.theme as HallTheme)
      : "crimson";
    const widget = HALL_WIDGETS.includes(body.widget as HallWidget)
      ? (body.widget as HallWidget)
      : "none";

    try {
      const court = await createCourt({
        lordUserId: session.userId,
        name,
        slug: body.slug || user.x_username || user.name,
        theme,
        widget,
        tagline: body.tagline,
      });
      return NextResponse.json({
        court: {
          id: court.id,
          slug: court.slug,
          name: court.name,
          theme: court.theme,
          widget: court.widget,
          tagline: court.tagline,
        },
        member: { rank: "duke", standing: 100, role: "lord" },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create court.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  } catch (err) {
    console.error("court post", err);
    return NextResponse.json({ error: "Could not update court." }, { status: 500 });
  }
}
