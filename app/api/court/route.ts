import { NextResponse } from "next/server";
import {
  createCourt,
  getMembershipForUser,
  getOpenJoinRequestByUser,
  listJoinRequestsForLord,
  requestJoinCourt,
  sealJoinRequest,
  type JoinRequestStatus,
} from "../../lib/courts";
import type { HallTheme, HallWidget } from "../../lib/ranks";
import { HALL_THEMES, HALL_WIDGETS } from "../../lib/ranks";
import { getSession } from "../../lib/session";
import { findUserById } from "../../lib/users";

function serializeRequest(r: {
  id: string;
  court_id: string;
  user_id: string;
  ask: string;
  status: JoinRequestStatus;
  created_at: string;
  sealed_at: string | null;
  name?: string;
  avatar_url?: string | null;
  x_username?: string | null;
  court_slug?: string;
  court_name?: string;
}) {
  return {
    id: r.id,
    courtId: r.court_id,
    userId: r.user_id,
    ask: r.ask,
    status: r.status,
    createdAt: r.created_at,
    sealedAt: r.sealed_at,
    name: r.name,
    avatarUrl: r.avatar_url,
    xUsername: r.x_username,
    courtSlug: r.court_slug,
    courtName: r.court_name,
  };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const [membership, pendingJoin, waitlist] = await Promise.all([
      getMembershipForUser(session.userId),
      getOpenJoinRequestByUser(session.userId),
      listJoinRequestsForLord(session.userId, { status: "all" }),
    ]);

    return NextResponse.json({
      membership: membership
        ? {
            courtId: membership.court_id,
            slug: membership.court_slug,
            name: membership.court_name,
            rank: membership.rank,
            standing: membership.standing,
            role: membership.role,
          }
        : null,
      pendingJoin: pendingJoin ? serializeRequest(pendingJoin) : null,
      waitlist: waitlist.map(serializeRequest),
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
      action?: "create" | "join" | "seal-join";
      name?: string;
      slug?: string;
      theme?: HallTheme;
      widget?: HallWidget;
      tagline?: string;
      ask?: string;
      requestId?: string;
      status?: JoinRequestStatus;
    };

    if (body.action === "seal-join") {
      if (!body.requestId) {
        return NextResponse.json(
          { error: "Waitlist entry required." },
          { status: 400 },
        );
      }
      if (
        body.status !== "granted" &&
        body.status !== "denied" &&
        body.status !== "deferred"
      ) {
        return NextResponse.json(
          { error: "Seal as granted, denied, or deferred." },
          { status: 400 },
        );
      }
      try {
        const result = await sealJoinRequest({
          lordUserId: session.userId,
          requestId: body.requestId,
          status: body.status,
        });
        const waitlist = await listJoinRequestsForLord(session.userId, {
          status: "all",
        });
        return NextResponse.json({
          request: serializeRequest(result.request),
          waitlist: waitlist.map(serializeRequest),
          member: result.member
            ? {
                rank: result.member.rank,
                standing: result.member.standing,
                role: result.member.role,
              }
            : null,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not seal waitlist.";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    if (body.action === "join") {
      const slug = body.slug?.trim() ?? "";
      if (!slug) {
        return NextResponse.json({ error: "Court slug required." }, { status: 400 });
      }
      // Open waitlist — no tribute / tier gate. Session is enough.
      try {
        const { court, request, alreadyMember } = await requestJoinCourt({
          userId: session.userId,
          slug,
          ask: body.ask,
        });
        return NextResponse.json({
          pending: !alreadyMember && request.status === "open",
          alreadyMember,
          court: {
            id: court.id,
            slug: court.slug,
            name: court.name,
            theme: court.theme,
            widget: court.widget,
          },
          request: serializeRequest(request),
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
