import { ensureSchema, getDb } from "./db";

export type DbHallComment = {
  id: string;
  court_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  name: string;
  avatar_url: string | null;
  x_username: string | null;
  rank: string | null;
  role: "lord" | "vassal" | null;
  cheer_count: number;
  cheered_by_me: boolean;
};

const MAX_BODY = 800;

function cleanBody(raw: string) {
  const body = raw.replace(/\r\n/g, "\n").trim().slice(0, MAX_BODY);
  if (!body) throw new Error("Write something for the hall.");
  return body;
}

export async function listHallComments(
  courtId: string,
  viewerUserId?: string | null,
): Promise<DbHallComment[]> {
  await ensureSchema();
  const db = getDb();
  const rows = viewerUserId
    ? await db`
        SELECT c.id, c.court_id, c.user_id, c.parent_id, c.body, c.created_at,
               u.name, u.avatar_url, u.x_username,
               m.rank, m.role,
               COALESCE(ch.cheer_count, 0)::int AS cheer_count,
               EXISTS (
                 SELECT 1 FROM hall_comment_cheers x
                 WHERE x.comment_id = c.id AND x.user_id = ${viewerUserId}
               ) AS cheered_by_me
        FROM hall_comments c
        JOIN users u ON u.id = c.user_id
        LEFT JOIN court_members m
          ON m.court_id = c.court_id AND m.user_id = c.user_id
        LEFT JOIN (
          SELECT comment_id, COUNT(*)::int AS cheer_count
          FROM hall_comment_cheers
          GROUP BY comment_id
        ) ch ON ch.comment_id = c.id
        WHERE c.court_id = ${courtId}
        ORDER BY c.created_at DESC
        LIMIT 120
      `
    : await db`
        SELECT c.id, c.court_id, c.user_id, c.parent_id, c.body, c.created_at,
               u.name, u.avatar_url, u.x_username,
               m.rank, m.role,
               COALESCE(ch.cheer_count, 0)::int AS cheer_count,
               false AS cheered_by_me
        FROM hall_comments c
        JOIN users u ON u.id = c.user_id
        LEFT JOIN court_members m
          ON m.court_id = c.court_id AND m.user_id = c.user_id
        LEFT JOIN (
          SELECT comment_id, COUNT(*)::int AS cheer_count
          FROM hall_comment_cheers
          GROUP BY comment_id
        ) ch ON ch.comment_id = c.id
        WHERE c.court_id = ${courtId}
        ORDER BY c.created_at DESC
        LIMIT 120
      `;
  return rows as DbHallComment[];
}

export async function addHallComment(input: {
  courtId: string;
  userId: string;
  body: string;
  parentId?: string | null;
}): Promise<DbHallComment> {
  await ensureSchema();
  const body = cleanBody(input.body);
  const db = getDb();

  let parentId: string | null = null;
  if (input.parentId) {
    const parents = await db`
      SELECT id FROM hall_comments
      WHERE id = ${input.parentId} AND court_id = ${input.courtId}
      LIMIT 1
    `;
    if (!parents[0]) throw new Error("That thread was not found.");
    // One level of nesting — replies attach to the root post.
    const root = await db`
      SELECT id, parent_id FROM hall_comments WHERE id = ${input.parentId} LIMIT 1
    `;
    const row = root[0] as { id: string; parent_id: string | null } | undefined;
    parentId = row?.parent_id ? row.parent_id : row?.id ?? null;
  }

  const inserted = await db`
    INSERT INTO hall_comments (court_id, user_id, parent_id, body)
    VALUES (
      ${input.courtId},
      ${input.userId},
      ${parentId},
      ${body}
    )
    RETURNING id, court_id, user_id, parent_id, body, created_at
  `;
  const comment = inserted[0] as {
    id: string;
    court_id: string;
    user_id: string;
    parent_id: string | null;
    body: string;
    created_at: string;
  };

  const listed = await listHallComments(input.courtId, input.userId);
  const found = listed.find((c) => c.id === comment.id);
  if (found) return found;

  return {
    ...comment,
    name: "Vassal",
    avatar_url: null,
    x_username: null,
    rank: null,
    role: null,
    cheer_count: 0,
    cheered_by_me: false,
  };
}

export async function cheerHallComment(input: {
  courtId: string;
  commentId: string;
  userId: string;
}): Promise<{ cheerCount: number; cheered: boolean }> {
  await ensureSchema();
  const db = getDb();

  const comments = await db`
    SELECT id, user_id FROM hall_comments
    WHERE id = ${input.commentId} AND court_id = ${input.courtId}
    LIMIT 1
  `;
  const comment = comments[0] as
    | { id: string; user_id: string }
    | undefined;
  if (!comment) throw new Error("Word not found in this hall.");

  if (comment.user_id === input.userId) {
    throw new Error("Cheer another vassal's words — not your own.");
  }

  const existing = await db`
    SELECT id FROM hall_comment_cheers
    WHERE comment_id = ${input.commentId} AND user_id = ${input.userId}
    LIMIT 1
  `;

  if (existing[0]) {
    await db`
      DELETE FROM hall_comment_cheers
      WHERE comment_id = ${input.commentId} AND user_id = ${input.userId}
    `;
    const countRows = await db`
      SELECT COUNT(*)::int AS n FROM hall_comment_cheers
      WHERE comment_id = ${input.commentId}
    `;
    return {
      cheerCount: Number((countRows[0] as { n: number }).n ?? 0),
      cheered: false,
    };
  }

  await db`
    INSERT INTO hall_comment_cheers (comment_id, user_id)
    VALUES (${input.commentId}, ${input.userId})
    ON CONFLICT (comment_id, user_id) DO NOTHING
  `;

  const countRows = await db`
    SELECT COUNT(*)::int AS n FROM hall_comment_cheers
    WHERE comment_id = ${input.commentId}
  `;
  return {
    cheerCount: Number((countRows[0] as { n: number }).n ?? 0),
    cheered: true,
  };
}

export async function removeHallComment(input: {
  courtId: string;
  commentId: string;
  userId: string;
  isLord: boolean;
}): Promise<boolean> {
  await ensureSchema();
  const db = getDb();
  if (input.isLord) {
    const rows = await db`
      DELETE FROM hall_comments
      WHERE id = ${input.commentId} AND court_id = ${input.courtId}
      RETURNING id
    `;
    return rows.length > 0;
  }
  const rows = await db`
    DELETE FROM hall_comments
    WHERE id = ${input.commentId}
      AND court_id = ${input.courtId}
      AND user_id = ${input.userId}
    RETURNING id
  `;
  return rows.length > 0;
}

function asBool(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "t" || v === "true" || v === "1";
  }
  return false;
}

export function serializeComment(c: DbHallComment) {
  return {
    id: c.id,
    parentId: c.parent_id,
    body: c.body,
    createdAt: c.created_at,
    cheerCount: Number(c.cheer_count) || 0,
    cheeredByMe: asBool(c.cheered_by_me),
    author: {
      userId: c.user_id,
      name: c.name || "Vassal",
      avatarUrl: c.avatar_url,
      xUsername: c.x_username,
      rank: c.rank,
      role: c.role,
    },
  };
}

export type HallCommentJson = ReturnType<typeof serializeComment>;
