import { notFound } from "next/navigation";
import { LordsHall, type HallData } from "../../components/LordsHall";
import { getHallBundle, getMembershipForUser } from "../../lib/courts";
import type { CourtRank, HallTheme, HallWidget } from "../../lib/ranks";
import { getSession } from "../../lib/session";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const bundle = await getHallBundle(slug).catch(() => null);
  return {
    title: bundle ? `${bundle.court.name} — Lord's Hall` : "Lord's Hall — Vassal",
  };
}

export default async function HallPage({ params }: PageProps) {
  const { slug } = await params;
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
  };

  if (session) {
    const membership = await getMembershipForUser(session.userId).catch(() => null);
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

  const initial: HallData = {
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
        }
      : null,
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

  return <LordsHall initial={initial} />;
}
