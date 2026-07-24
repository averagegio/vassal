import { redirect } from "next/navigation";
import { DashboardShell, type DashboardData } from "../components/DashboardShell";
import { getSession } from "../lib/session";
import {
  getDashboardStats,
  getUserDecree,
  listPetitions,
  listTenants,
} from "../lib/users";

export const metadata = {
  title: "Dashboard — Vassal",
  description: "Your holding: petitions, tenants, and Steward.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let initialData: DashboardData | null = null;
  let loadError: string | undefined;

  try {
    const [stats, petitions, tenants, decree] = await Promise.all([
      getDashboardStats(session.userId),
      listPetitions(session.userId),
      listTenants(session.userId),
      getUserDecree(session.userId),
    ]);

    initialData = {
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
    };
  } catch (err) {
    console.error("dashboard page", err);
    loadError = "Could not load your holding.";
  }

  return <DashboardShell initialData={initialData} loadError={loadError} />;
}
