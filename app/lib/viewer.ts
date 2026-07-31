import { getMembershipForUser } from "./courts";
import { holdingHomeHref, type HoldingCourtRef } from "./home";
import { getSession } from "./session";
import { findUserById } from "./users";

export type AppViewer = {
  id: string;
  name: string;
  email: string;
  holding: "fan" | "estate";
  avatarUrl: string | null;
  court: HoldingCourtRef | null;
  homeHref: string;
};

export async function getAppViewer(): Promise<AppViewer | null> {
  const session = await getSession();
  if (!session) return null;

  const [user, membership] = await Promise.all([
    findUserById(session.userId),
    getMembershipForUser(session.userId),
  ]);
  if (!user) return null;

  const court: HoldingCourtRef | null = membership
    ? {
        slug: membership.court_slug,
        role: membership.role === "lord" ? "lord" : "vassal",
      }
    : null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    holding: user.holding,
    avatarUrl: user.avatar_url,
    court,
    homeHref: holdingHomeHref(court),
  };
}
