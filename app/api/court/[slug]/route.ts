import { NextResponse } from "next/server";
import {
  addMoodPin,
  addPlaylistTrack,
  bumpSeasonScore,
  getHallBundle,
  getMembershipForUser,
  updateCourtSettings,
  updateSeasonTargets,
} from "../../../lib/courts";
import {
  HALL_THEMES,
  HALL_WIDGETS,
  type HallTheme,
  type HallWidget,
} from "../../../lib/ranks";
import { getSession } from "../../../lib/session";

type Params = { params: Promise<{ slug: string }> };

function serializeHall(
  bundle: NonNullable<Awaited<ReturnType<typeof getHallBundle>>>,
  viewer: {
    isMember: boolean;
    isLord: boolean;
    rank: string | null;
    standing: number | null;
    userId?: string | null;
  },
) {
  return {
    court: {
      id: bundle.court.id,
      slug: bundle.court.slug,
      name: bundle.court.name,
      theme: bundle.court.theme,
      widget: bundle.court.widget,
      tagline: bundle.court.tagline,
    },
    lord: bundle.lord
      ? {
          id: bundle.lord.id,
          name: bundle.lord.name,
          avatarUrl: bundle.lord.avatar_url,
          xUsername: bundle.lord.x_username,
        }
      : null,
    season: {
      id: bundle.season.id,
      title: bundle.season.title,
      targetReplies: bundle.season.target_replies,
      targetReposts: bundle.season.target_reposts,
      targetMentions: bundle.season.target_mentions,
      startsAt: bundle.season.starts_at,
      endsAt: bundle.season.ends_at,
    },
    scoreboard: bundle.scoreboard.map((m) => ({
      userId: m.user_id,
      name: m.name,
      avatarUrl: m.avatar_url,
      rank: m.rank,
      role: m.role,
      standing: m.standing,
      replies: m.replies,
      reposts: m.reposts,
      mentions: m.mentions,
    })),
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
  };
}

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
      userId: string | null;
    } = {
      isMember: false,
      isLord: false,
      rank: null,
      standing: null,
      userId: session?.userId ?? null,
    };

    if (session) {
      const membership = await getMembershipForUser(session.userId);
      if (membership && membership.court_id === bundle.court.id) {
        viewer = {
          isMember: true,
          isLord: membership.role === "lord",
          rank: membership.rank,
          standing: membership.standing,
          userId: session.userId,
        };
      }
    }

    return NextResponse.json(serializeHall(bundle, viewer));
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
      return NextResponse.json(
        { error: "Only the Lord may theme the hall." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      theme?: HallTheme;
      widget?: HallWidget;
      tagline?: string;
      name?: string;
      seasonTitle?: string;
      targetReplies?: number;
      targetReposts?: number;
      targetMentions?: number;
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

    let season = bundle.season;
    if (
      body.seasonTitle !== undefined ||
      body.targetReplies !== undefined ||
      body.targetReposts !== undefined ||
      body.targetMentions !== undefined
    ) {
      const next = await updateSeasonTargets(session.userId, {
        title: body.seasonTitle,
        targetReplies: body.targetReplies,
        targetReposts: body.targetReposts,
        targetMentions: body.targetMentions,
      });
      if (next) season = next;
    }

    return NextResponse.json({
      court: updated,
      season: {
        id: season.id,
        title: season.title,
        targetReplies: season.target_replies,
        targetReposts: season.target_reposts,
        targetMentions: season.target_mentions,
        startsAt: season.starts_at,
        endsAt: season.ends_at,
      },
    });
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
      kind?: "playlist" | "moodboard" | "score";
      title?: string;
      artist?: string;
      url?: string;
      imageUrl?: string;
      sourceUrl?: string;
      replies?: number;
      reposts?: number;
      mentions?: number;
    };

    if (body.kind === "score") {
      const replies = Math.max(0, Math.min(50, Math.round(body.replies ?? 0)));
      const reposts = Math.max(0, Math.min(50, Math.round(body.reposts ?? 0)));
      const mentions = Math.max(0, Math.min(50, Math.round(body.mentions ?? 0)));
      if (replies + reposts + mentions < 1) {
        return NextResponse.json(
          { error: "Log at least one reply, repost, or mention." },
          { status: 400 },
        );
      }
      const row = await bumpSeasonScore({
        courtId: bundle.court.id,
        userId: session.userId,
        replies,
        reposts,
        mentions,
      });
      const fresh = await getHallBundle(slug);
      return NextResponse.json({
        score: row
          ? {
              userId: row.user_id,
              replies: row.replies,
              reposts: row.reposts,
              mentions: row.mentions,
              standing: row.standing,
            }
          : null,
        scoreboard: fresh?.scoreboard.map((m) => ({
          userId: m.user_id,
          name: m.name,
          avatarUrl: m.avatar_url,
          rank: m.rank,
          role: m.role,
          standing: m.standing,
          replies: m.replies,
          reposts: m.reposts,
          mentions: m.mentions,
        })),
      });
    }

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
