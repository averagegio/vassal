import { ensureSchema, getDb } from "./db";
import { profileHandle } from "./profile";
import { findUserById, type PublicUser } from "./users";

export type FollowCounts = {
  followers: number;
  following: number;
};

export type FollowListRow = {
  id: string;
  name: string;
  x_username: string | null;
  avatar_url: string | null;
  holding: "fan" | "estate";
  followed_at: string;
};

export { profileHandle };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function findUserByHandle(
  handle: string,
): Promise<PublicUser | null> {
  await ensureSchema();
  const raw = handle.trim().replace(/^@/, "");
  if (!raw) return null;

  if (UUID_RE.test(raw)) {
    const byId = await findUserById(raw);
    if (!byId) return null;
    return {
      id: byId.id,
      name: byId.name,
      holding: byId.holding,
      decree: byId.decree,
      x_username: byId.x_username,
      avatar_url: byId.avatar_url,
      header_url: byId.header_url,
      created_at: byId.created_at,
    };
  }

  const db = getDb();
  const rows = await db`
    SELECT id, name, holding, decree, x_username, avatar_url, header_url, created_at
    FROM users
    WHERE lower(x_username) = ${raw.toLowerCase()}
    LIMIT 1
  `;
  return (rows[0] as PublicUser | undefined) ?? null;
}

export async function getFollowCounts(userId: string): Promise<FollowCounts> {
  await ensureSchema();
  const db = getDb();
  const rows = await db`
    SELECT
      (SELECT COUNT(*)::int FROM follows WHERE following_id = ${userId}) AS followers,
      (SELECT COUNT(*)::int FROM follows WHERE follower_id = ${userId}) AS following
  `;
  const row = rows[0] as { followers: number; following: number } | undefined;
  return {
    followers: row?.followers ?? 0,
    following: row?.following ?? 0,
  };
}

export async function isFollowing(
  followerId: string,
  followingId: string,
): Promise<boolean> {
  if (followerId === followingId) return false;
  await ensureSchema();
  const db = getDb();
  const rows = await db`
    SELECT 1 FROM follows
    WHERE follower_id = ${followerId} AND following_id = ${followingId}
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function followUser(
  followerId: string,
  followingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (followerId === followingId) {
    return { ok: false, error: "You cannot follow yourself." };
  }
  const target = await findUserById(followingId);
  if (!target) return { ok: false, error: "User not found." };

  await ensureSchema();
  const db = getDb();
  try {
    await db`
      INSERT INTO follows (follower_id, following_id)
      VALUES (${followerId}, ${followingId})
      ON CONFLICT (follower_id, following_id) DO NOTHING
    `;
  } catch (err) {
    console.error("followUser", err);
    return { ok: false, error: "Could not follow." };
  }
  return { ok: true };
}

export async function unfollowUser(
  followerId: string,
  followingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await ensureSchema();
  const db = getDb();
  await db`
    DELETE FROM follows
    WHERE follower_id = ${followerId} AND following_id = ${followingId}
  `;
  return { ok: true };
}

export async function listFollowers(
  userId: string,
  limit = 50,
): Promise<FollowListRow[]> {
  await ensureSchema();
  const db = getDb();
  const rows = await db`
    SELECT u.id, u.name, u.x_username, u.avatar_url, u.holding, f.created_at AS followed_at
    FROM follows f
    JOIN users u ON u.id = f.follower_id
    WHERE f.following_id = ${userId}
    ORDER BY f.created_at DESC
    LIMIT ${Math.min(100, Math.max(1, limit))}
  `;
  return rows as FollowListRow[];
}

export async function listFollowing(
  userId: string,
  limit = 50,
): Promise<FollowListRow[]> {
  await ensureSchema();
  const db = getDb();
  const rows = await db`
    SELECT u.id, u.name, u.x_username, u.avatar_url, u.holding, f.created_at AS followed_at
    FROM follows f
    JOIN users u ON u.id = f.following_id
    WHERE f.follower_id = ${userId}
    ORDER BY f.created_at DESC
    LIMIT ${Math.min(100, Math.max(1, limit))}
  `;
  return rows as FollowListRow[];
}
