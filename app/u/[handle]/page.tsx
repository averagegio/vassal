import { notFound } from "next/navigation";
import {
  PublicProfile,
  type PublicProfileData,
} from "../../components/PublicProfile";
import { getMembershipForUser } from "../../lib/courts";
import {
  findUserByHandle,
  getFollowCounts,
  isFollowing,
  listFollowers,
  listFollowing,
} from "../../lib/follows";
import { profileHandle } from "../../lib/profile";
import { getSession } from "../../lib/session";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { handle } = await params;
  const user = await findUserByHandle(decodeURIComponent(handle)).catch(
    () => null,
  );
  return {
    title: user ? `${user.name} — Vassal` : "Profile — Vassal",
  };
}

export default async function UserProfilePage({
  params,
  searchParams,
}: PageProps) {
  const { handle: raw } = await params;
  const { tab: tabParam } = await searchParams;
  const handle = decodeURIComponent(raw);
  const initialTab =
    tabParam === "followers" || tabParam === "following" ? tabParam : "about";
  const user = await findUserByHandle(handle).catch(() => null);
  if (!user) notFound();

  const session = await getSession();
  const [counts, following, followers, followingList, membership] =
    await Promise.all([
      getFollowCounts(user.id),
      session ? isFollowing(session.userId, user.id) : Promise.resolve(false),
      listFollowers(user.id),
      listFollowing(user.id),
      getMembershipForUser(user.id).catch(() => null),
    ]);

  const initial: PublicProfileData = {
    user: {
      id: user.id,
      name: user.name,
      holding: user.holding,
      decree: user.decree,
      xUsername: user.x_username,
      avatarUrl: user.avatar_url,
      headerUrl: user.header_url,
    },
    counts,
    isFollowing: following,
    isSelf: session?.userId === user.id,
    court: membership
      ? {
          slug: membership.court_slug,
          name: membership.court_name,
          role: membership.role,
        }
      : null,
    followers: followers.map((r) => ({
      id: r.id,
      name: r.name,
      xUsername: r.x_username,
      avatarUrl: r.avatar_url,
      holding: r.holding,
      handle: profileHandle(r),
    })),
    following: followingList.map((r) => ({
      id: r.id,
      name: r.name,
      xUsername: r.x_username,
      avatarUrl: r.avatar_url,
      holding: r.holding,
      handle: profileHandle(r),
    })),
  };

  return <PublicProfile initial={initial} initialTab={initialTab} />;
}
