import { notFound } from "next/navigation";
import { LordsHall, type HallData } from "../../components/LordsHall";
import { getHallBundle, getMembershipForUser } from "../../lib/courts";
import { getFollowCounts, isFollowing } from "../../lib/follows";
import type { CourtRank, HallTheme, HallWidget } from "../../lib/ranks";
import { getSession } from "../../lib/session";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const bundle = await getHallBundle(slug).catch(() => null);
  return {
    title: bundle ? `${bundle.court.name} — Lord's Hall` : "Lord's Hall — Vassal",
  };
}

function toHallData(
  bundle: NonNullable<Awaited<ReturnType<typeof getHallBundle>>>,
  viewer: HallData["viewer"],
  lordFollowers: number,
): HallData {
  return {
    court: {
      id: bundle.court.id,
      slug: bundle.court.slug,
      name: bundle.court.name,
      theme: bundle.court.theme as HallTheme,
      widget: bundle.court.widget as HallWidget,
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
      name: m.name || "Vassal",
      avatarUrl: m.avatar_url,
      xUsername: m.x_username,
      rank: (m.rank as CourtRank) || "serf",
      role: m.role,
      standing: m.standing,
      replies: m.replies,
      reposts: m.reposts,
      mentions: m.mentions,
    })),
    leaderboard: bundle.leaderboard.map((m) => ({
      userId: m.user_id,
      name: m.name || "Vassal",
      avatarUrl: m.avatar_url,
      xUsername: m.x_username,
      rank: (m.rank as CourtRank) || "serf",
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

export default async function HallPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  let bundle: Awaited<ReturnType<typeof getHallBundle>> = null;
  try {
    bundle = await getHallBundle(slug);
  } catch (err) {
    console.error("hall page", err);
  }
  if (!bundle) notFound();

  const session = await getSession();
  let viewer: HallData["viewer"] = {
    isMember: false,
    isLord: false,
    rank: null,
    standing: null,
    userId: session?.userId ?? null,
    isFollowingLord: false,
  };

  if (session) {
    const membership = await getMembershipForUser(session.userId).catch(
      () => null,
    );
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
      ).catch(() => false);
    }
  }

  const lordFollowers = bundle.lord
    ? (await getFollowCounts(bundle.lord.id).catch(() => ({ followers: 0 })))
        .followers
    : 0;

  const tabParam = Array.isArray(query.tab) ? query.tab[0] : query.tab;
  const initialTab =
    tabParam === "setup" || tabParam === "community" || tabParam === "scoreboard"
      ? tabParam
      : undefined;

  return (
    <LordsHall
      initial={toHallData(bundle, viewer, lordFollowers)}
      initialTab={initialTab}
    />
  );
}
