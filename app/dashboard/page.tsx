import { redirect } from "next/navigation";
import { DashboardShell, type DashboardData } from "../components/DashboardShell";
import { getSession } from "../lib/session";
import {
  findUserById,
  getDashboardStats,
  getUserDecree,
  listDecrees,
  listPetitions,
  listTenants,
} from "../lib/users";
import { getMembershipForUser } from "../lib/courts";
import { getFollowCounts } from "../lib/follows";
import { profileHandle } from "../lib/profile";
import type { CourtRank } from "../lib/ranks";

export const metadata = {
  title: "Dashboard — Vassal",
  description: "Your holding: petitions, tenants, and Steward.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await findUserById(session.userId);
  if (!user) redirect("/login");

  let initialData: DashboardData | null = null;
  let loadError: string | undefined;

  try {
    const [stats, petitions, tenants, decree, decrees, membership, follows] =
      await Promise.all([
        getDashboardStats(session.userId),
        listPetitions(session.userId),
        listTenants(session.userId),
        getUserDecree(session.userId),
        listDecrees(session.userId),
        getMembershipForUser(session.userId),
        getFollowCounts(session.userId),
      ]);

    initialData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        holding: user.holding,
        xUsername: user.x_username,
        avatarUrl: user.avatar_url,
        headerUrl: user.header_url,
      },
      follows: {
        followers: follows.followers,
        following: follows.following,
        handle: profileHandle(user),
      },
      stats,
      decree,
      decrees: decrees.map((d) => ({
        id: d.id,
        body: d.body,
        createdAt: d.created_at,
      })),
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
      court: membership
        ? {
            slug: membership.court_slug,
            name: membership.court_name,
            rank: membership.rank as CourtRank,
            standing: membership.standing,
            role: membership.role,
          }
        : null,
    };
  } catch (err) {
    console.error("dashboard page", err);
    loadError = "Could not load your holding.";
  }

  return <DashboardShell initialData={initialData} loadError={loadError} />;
}
