import { NextResponse } from "next/server";
import {
  addMoodPin,
  addPlaylistTrack,
  getHallBundle,
  getMembershipForUser,
  updateCourtSettings,
} from "../../../lib/courts";
import {
  HALL_THEMES,
  HALL_WIDGETS,
  type HallTheme,
  type HallWidget,
} from "../../../lib/ranks";
import { getSession } from "../../../lib/session";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const bundle = await getHallBundle(slug);
    if (!bundle) {
      return NextResponse.json({ error: "Hall not found." }, { status: 404 });
    }

    const session = await getSession();
    let viewer: {
      isMember: boolean;
      isLord: boolean;
      rank: string | null;
      standing: number | null;
    } = { isMember: false, isLord: false, rank: null, standing: null };

    if (session) {
      const membership = await getMembershipForUser(session.userId);
      if (membership && membership.court_id === bundle.court.id) {
        viewer = {
          isMember: true,
          isLord: membership.role === "lord",
          rank: membership.rank,
          standing: membership.standing,
        };
      }
    }

    return NextResponse.json({
      court: bundle.court,
      lord: bundle.lord
        ? {
            id: bundle.lord.id,
            name: bundle.lord.name,
            avatarUrl: bundle.lord.avatar_url,
            xUsername: bundle.lord.x_username,
          }
        : null,
      leaderboard: bundle.leaderboard.map((m) => ({
        userId: m.user_id,
        name: m.name,
        avatarUrl: m.avatar_url,
        xUsername: m.x_username,
        rank: m.rank,
        standing: m.standing,
        role: m.role,
      })),
      playlist: bundle.playlist.map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        url: t.url,
        by: t.name,
      })),
      moodboard: bundle.moodboard.map((p) => ({
        id: p.id,
        title: p.title,
        imageUrl: p.image_url,
        sourceUrl: p.source_url,
        by: p.name,
      })),
      viewer,
    });
  } catch (err) {
    console.error("hall get", err);
    return NextResponse.json({ error: "Could not load hall." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { slug } = await params;
    const bundle = await getHallBundle(slug);
    if (!bundle) {
      return NextResponse.json({ error: "Hall not found." }, { status: 404 });
    }
    if (bundle.court.lord_user_id !== session.userId) {
      return NextResponse.json({ error: "Only the Lord may theme the hall." }, { status: 403 });
    }

    const body = (await request.json()) as {
      theme?: HallTheme;
      widget?: HallWidget;
      tagline?: string;
      name?: string;
    };

    const theme = HALL_THEMES.includes(body.theme as HallTheme)
      ? (body.theme as HallTheme)
      : undefined;
    const widget = HALL_WIDGETS.includes(body.widget as HallWidget)
      ? (body.widget as HallWidget)
      : undefined;

    const updated = await updateCourtSettings(session.userId, {
      theme,
      widget,
      tagline: body.tagline,
      name: body.name,
    });
    return NextResponse.json({ court: updated });
  } catch (err) {
    console.error("hall patch", err);
    return NextResponse.json({ error: "Could not update hall." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { slug } = await params;
    const bundle = await getHallBundle(slug);
    if (!bundle) {
      return NextResponse.json({ error: "Hall not found." }, { status: 404 });
    }

    const membership = await getMembershipForUser(session.userId);
    if (!membership || membership.court_id !== bundle.court.id) {
      return NextResponse.json(
        { error: "Swear fealty to contribute to this hall." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      kind?: "playlist" | "moodboard";
      title?: string;
      artist?: string;
      url?: string;
      imageUrl?: string;
      sourceUrl?: string;
    };

    if (body.kind === "playlist") {
      if (bundle.court.widget !== "playlist") {
        return NextResponse.json(
          { error: "This hall is not in playlist mode." },
          { status: 400 },
        );
      }
      const track = await addPlaylistTrack({
        courtId: bundle.court.id,
        userId: session.userId,
        title: body.title ?? "",
        artist: body.artist,
        url: body.url,
      });
      return NextResponse.json({
        track: {
          id: track.id,
          title: track.title,
          artist: track.artist,
          url: track.url,
          by: session.name,
        },
      });
    }

    if (body.kind === "moodboard") {
      if (bundle.court.widget !== "moodboard") {
        return NextResponse.json(
          { error: "This hall is not in mood board mode." },
          { status: 400 },
        );
      }
      const pin = await addMoodPin({
        courtId: bundle.court.id,
        userId: session.userId,
        title: body.title,
        imageUrl: body.imageUrl ?? "",
        sourceUrl: body.sourceUrl || body.url,
      });
      return NextResponse.json({
        pin: {
          id: pin.id,
          title: pin.title,
          imageUrl: pin.image_url,
          sourceUrl: pin.source_url,
          by: session.name,
        },
      });
    }

    return NextResponse.json({ error: "Unknown contribution." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not contribute.";
    console.error("hall post", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
