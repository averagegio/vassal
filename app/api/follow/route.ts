import { NextResponse } from "next/server";
import {
  findUserByHandle,
  followUser,
  getFollowCounts,
  isFollowing,
  listFollowers,
  listFollowing,
  unfollowUser,
} from "../../lib/follows";
import { getSession } from "../../lib/session";
import { findUserById } from "../../lib/users";

async function resolveTargetUserId(body: {
  userId?: string;
  handle?: string;
}): Promise<string | null> {
  if (body.userId?.trim()) {
    const user = await findUserById(body.userId.trim());
    return user?.id ?? null;
  }
  if (body.handle?.trim()) {
    const user = await findUserByHandle(body.handle.trim());
    return user?.id ?? null;
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle")?.trim();
    const userIdParam = searchParams.get("userId")?.trim();
    const list = searchParams.get("list"); // followers | following | null

    let targetId: string | null = null;
    if (userIdParam) {
      const user = await findUserById(userIdParam);
      targetId = user?.id ?? null;
    } else if (handle) {
      const user = await findUserByHandle(handle);
      targetId = user?.id ?? null;
    }

    if (!targetId) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const session = await getSession();
    const [counts, following] = await Promise.all([
      getFollowCounts(targetId),
      session ? isFollowing(session.userId, targetId) : Promise.resolve(false),
    ]);

    if (list === "followers") {
      const rows = await listFollowers(targetId);
      return NextResponse.json({
        counts,
        isFollowing: following,
        list: rows.map(serializeRow),
      });
    }
    if (list === "following") {
      const rows = await listFollowing(targetId);
      return NextResponse.json({
        counts,
        isFollowing: following,
        list: rows.map(serializeRow),
      });
    }

    return NextResponse.json({ counts, isFollowing: following });
  } catch (err) {
    console.error("follow get", err);
    return NextResponse.json({ error: "Could not load follows." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { userId?: string; handle?: string };
    const targetId = await resolveTargetUserId(body);
    if (!targetId) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const result = await followUser(session.userId, targetId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const counts = await getFollowCounts(targetId);
    return NextResponse.json({ ok: true, isFollowing: true, counts });
  } catch (err) {
    console.error("follow post", err);
    return NextResponse.json({ error: "Could not follow." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { userId?: string; handle?: string };
    const targetId = await resolveTargetUserId(body);
    if (!targetId) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    await unfollowUser(session.userId, targetId);
    const counts = await getFollowCounts(targetId);
    return NextResponse.json({ ok: true, isFollowing: false, counts });
  } catch (err) {
    console.error("follow delete", err);
    return NextResponse.json({ error: "Could not unfollow." }, { status: 500 });
  }
}

function serializeRow(row: {
  id: string;
  name: string;
  x_username: string | null;
  avatar_url: string | null;
  holding: "fan" | "estate";
  followed_at: string;
}) {
  return {
    id: row.id,
    name: row.name,
    xUsername: row.x_username,
    avatarUrl: row.avatar_url,
    holding: row.holding,
    followedAt: row.followed_at,
    handle: row.x_username || row.id,
  };
}
