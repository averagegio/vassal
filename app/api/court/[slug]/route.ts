import { NextResponse } from "next/server";
import { fetchApiFeed } from "../../../lib/api-feed";
import {
  addApiFeed,
  addMoodPin,
  addPlaylistTrack,
  bumpSeasonScore,
  getApiFeedById,
  getHallBundle,
  getMembershipForUser,
  removeApiFeed,
  removePlaylistTrack,
  updateCourtSettings,
  updateSeasonTargets,
} from "../../../lib/courts";
import { getFollowCounts, isFollowing } from "../../../lib/follows";
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
    isFollowingLord: boolean;
  },
  lordFollowers: number,
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
          followers: lordFollowers,
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
      xUsername: m.x_username,
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
      userId: t.user_id,
    })),
    moodboard: bundle.moodboard.map((p) => ({
      id: p.id,
      title: p.title,
      imageUrl: p.image_url,
      sourceUrl: p.source_url,
      by: p.name,
    })),
    apiFeeds: bundle.apiFeeds.map((f) => ({
      id: f.id,
      label: f.label,
      apiUrl: f.api_url,
      jsonPath: f.json_path,
      by: f.name,
      userId: f.user_id,
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
      isFollowingLord: boolean;
    } = {
      isMember: false,
      isLord: false,
      rank: null,
      standing: null,
      userId: session?.userId ?? null,
      isFollowingLord: false,
    };

    if (session) {
      const membership = await getMembershipForUser(session.userId);
      if (membership && membership.court_id === bundle.court.id) {
        viewer = {
          ...viewer,
          isMember: true,
          isLord: membership.role === "lord",
          rank: membership.rank,
          standing: membership.standing,
          userId: session.userId,
        };
      }
      if (bundle.lord && bundle.lord.id !== session.userId) {
        viewer.isFollowingLord = await isFollowing(
          session.userId,
          bundle.lord.id,
        );
      }
    }

    const lordFollowers = bundle.lord
      ? (await getFollowCounts(bundle.lord.id)).followers
      : 0;

    return NextResponse.json(serializeHall(bundle, viewer, lordFollowers));
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
    const { slug } = await params;
    const bundle = await getHallBundle(slug);
    if (!bundle) {
      return NextResponse.json({ error: "Hall not found." }, { status: 404 });
    }

    const body = (await request.json()) as {
      kind?:
        | "playlist"
        | "playlist-remove"
        | "moodboard"
        | "score"
        | "api"
        | "api-preview"
        | "api-remove";
      title?: string;
      artist?: string;
      url?: string;
      trackId?: string;
      imageUrl?: string;
      sourceUrl?: string;
      label?: string;
      apiUrl?: string;
      jsonPath?: string;
      feedId?: string;
      replies?: number;
      reposts?: number;
      mentions?: number;
    };

    // Saved feeds are public hall content — anyone can load them.
    if (body.kind === "api-preview" && body.feedId) {
      if (bundle.court.widget !== "api") {
        return NextResponse.json(
          { error: "This hall is not in API import mode." },
          { status: 400 },
        );
      }
      const feed = await getApiFeedById(bundle.court.id, body.feedId);
      if (!feed) {
        return NextResponse.json({ error: "Feed not found." }, { status: 404 });
      }
      const result = await fetchApiFeed({
        apiUrl: feed.api_url,
        jsonPath: feed.json_path,
      });
      return NextResponse.json({
        items: result.items,
        count: result.count,
      });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await getMembershipForUser(session.userId);
    if (!membership || membership.court_id !== bundle.court.id) {
      return NextResponse.json(
        { error: "Swear fealty to contribute to this hall." },
        { status: 403 },
      );
    }

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
      const isLord = membership.role === "lord";
      // Built-in hall booth: lords can always set music. Vassals queue when
      // the community playlist widget is enabled.
      if (!isLord && bundle.court.widget !== "playlist") {
        return NextResponse.json(
          {
            error:
              "Only the Lord may set hall music unless the playlist widget is open.",
          },
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
          userId: track.user_id,
        },
      });
    }

    if (body.kind === "playlist-remove") {
      if (!body.trackId) {
        return NextResponse.json({ error: "Track required." }, { status: 400 });
      }
      const removed = await removePlaylistTrack({
        courtId: bundle.court.id,
        trackId: body.trackId,
        userId: session.userId,
        isLord: membership.role === "lord",
      });
      if (!removed) {
        return NextResponse.json(
          { error: "Could not remove that track." },
          { status: 404 },
        );
      }
      return NextResponse.json({ ok: true, trackId: body.trackId });
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

    if (body.kind === "api-preview") {
      if (bundle.court.widget !== "api") {
        return NextResponse.json(
          { error: "This hall is not in API import mode." },
          { status: 400 },
        );
      }
      const result = await fetchApiFeed({
        apiUrl: body.apiUrl ?? "",
        jsonPath: body.jsonPath,
      });
      return NextResponse.json({
        items: result.items,
        count: result.count,
      });
    }

    if (body.kind === "api") {
      if (bundle.court.widget !== "api") {
        return NextResponse.json(
          { error: "This hall is not in API import mode." },
          { status: 400 },
        );
      }
      // Validate the endpoint before saving.
      await fetchApiFeed({
        apiUrl: body.apiUrl ?? "",
        jsonPath: body.jsonPath,
      });
      const feed = await addApiFeed({
        courtId: bundle.court.id,
        userId: session.userId,
        label: body.label || body.title,
        apiUrl: body.apiUrl ?? "",
        jsonPath: body.jsonPath,
      });
      return NextResponse.json({
        feed: {
          id: feed.id,
          label: feed.label,
          apiUrl: feed.api_url,
          jsonPath: feed.json_path,
          by: session.name,
          userId: session.userId,
        },
      });
    }

    if (body.kind === "api-remove") {
      if (bundle.court.widget !== "api") {
        return NextResponse.json(
          { error: "This hall is not in API import mode." },
          { status: 400 },
        );
      }
      if (!body.feedId) {
        return NextResponse.json({ error: "Feed id required." }, { status: 400 });
      }
      const removed = await removeApiFeed({
        courtId: bundle.court.id,
        feedId: body.feedId,
        userId: session.userId,
        isLord: membership.role === "lord",
      });
      if (!removed) {
        return NextResponse.json(
          { error: "Could not remove that feed." },
          { status: 404 },
        );
      }
      return NextResponse.json({ ok: true, feedId: body.feedId });
    }

    return NextResponse.json({ error: "Unknown contribution." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not contribute.";
    console.error("hall post", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
