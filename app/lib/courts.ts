import { ensureSchema, getDb } from "./db";
import {
  type CourtRank,
  type HallTheme,
  type HallWidget,
  safeHttpUrl,
  slugifyCourt,
} from "./ranks";

export type DbCourt = {
  id: string;
  lord_user_id: string;
  slug: string;
  name: string;
  theme: HallTheme;
  widget: HallWidget;
  tagline: string;
  created_at: string;
};

export type DbCourtMember = {
  id: string;
  court_id: string;
  user_id: string;
  rank: CourtRank;
  standing: number;
  role: "lord" | "vassal";
  joined_at: string;
  name?: string;
  avatar_url?: string | null;
  x_username?: string | null;
};

export type DbPlaylistTrack = {
  id: string;
  court_id: string;
  user_id: string;
  title: string;
  artist: string;
  url: string;
  created_at: string;
  name?: string;
};

export type DbMoodPin = {
  id: string;
  court_id: string;
  user_id: string;
  title: string;
  image_url: string;
  source_url: string;
  created_at: string;
  name?: string;
};

async function uniqueSlug(base: string) {
  const db = getDb();
  const root = slugifyCourt(base) || "court";
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const rows = await db`
      SELECT id FROM courts WHERE slug = ${candidate} LIMIT 1
    `;
    if (rows.length === 0) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

export async function getCourtBySlug(slug: string): Promise<DbCourt | null> {
  await ensureSchema();
  const db = getDb();
  const rows = await db`
    SELECT id, lord_user_id, slug, name, theme, widget, tagline, created_at
    FROM courts WHERE slug = ${slugifyCourt(slug)} LIMIT 1
  `;
  return (rows[0] as DbCourt | undefined) ?? null;
}

export async function getCourtByLord(
  lordUserId: string,
): Promise<DbCourt | null> {
  await ensureSchema();
  const db = getDb();
  const rows = await db`
    SELECT id, lord_user_id, slug, name, theme, widget, tagline, created_at
    FROM courts WHERE lord_user_id = ${lordUserId} LIMIT 1
  `;
  return (rows[0] as DbCourt | undefined) ?? null;
}

export async function getMembershipForUser(
  userId: string,
): Promise<(DbCourtMember & { court_slug: string; court_name: string }) | null> {
  await ensureSchema();
  const db = getDb();
  const rows = await db`
    SELECT m.id, m.court_id, m.user_id, m.rank, m.standing, m.role, m.joined_at,
           c.slug AS court_slug, c.name AS court_name
    FROM court_members m
    JOIN courts c ON c.id = m.court_id
    WHERE m.user_id = ${userId}
    LIMIT 1
  `;
  return (rows[0] as
    | (DbCourtMember & { court_slug: string; court_name: string })
    | undefined) ?? null;
}

export async function createCourt(input: {
  lordUserId: string;
  name: string;
  slug?: string;
  theme?: HallTheme;
  widget?: HallWidget;
  tagline?: string;
}): Promise<DbCourt> {
  await ensureSchema();
  const existing = await getCourtByLord(input.lordUserId);
  if (existing) return existing;

  const membership = await getMembershipForUser(input.lordUserId);
  if (membership) {
    throw new Error("Already sworn to another court.");
  }

  const db = getDb();
  const slug = await uniqueSlug(input.slug || input.name);
  const theme = input.theme ?? "crimson";
  const widget = input.widget ?? "none";
  const tagline = (input.tagline ?? "").trim().slice(0, 120);

  const rows = await db`
    INSERT INTO courts (lord_user_id, slug, name, theme, widget, tagline)
    VALUES (
      ${input.lordUserId},
      ${slug},
      ${input.name.trim().slice(0, 80)},
      ${theme},
      ${widget},
      ${tagline}
    )
    RETURNING id, lord_user_id, slug, name, theme, widget, tagline, created_at
  `;
  const court = rows[0] as DbCourt;

  await db`
    INSERT INTO court_members (court_id, user_id, rank, standing, role)
    VALUES (${court.id}, ${input.lordUserId}, 'duke', 100, 'lord')
  `;

  await ensureActiveSeason(court.id, input.lordUserId);
  return court;
}

export async function joinCourt(input: {
  userId: string;
  slug: string;
}): Promise<{ court: DbCourt; member: DbCourtMember }> {
  await ensureSchema();
  const court = await getCourtBySlug(input.slug);
  if (!court) throw new Error("Court not found.");

  if (court.lord_user_id === input.userId) {
    const db = getDb();
    const rows = await db`
      INSERT INTO court_members (court_id, user_id, rank, standing, role)
      VALUES (${court.id}, ${input.userId}, 'duke', 100, 'lord')
      ON CONFLICT (user_id) DO UPDATE
        SET court_id = EXCLUDED.court_id,
            rank = 'duke',
            role = 'lord',
            standing = GREATEST(court_members.standing, 100)
      RETURNING id, court_id, user_id, rank, standing, role, joined_at
    `;
    return { court, member: rows[0] as DbCourtMember };
  }

  const existing = await getMembershipForUser(input.userId);
  if (existing && existing.court_id !== court.id) {
    throw new Error("Already sworn to another court. One court per vassal for now.");
  }
  if (existing && existing.court_id === court.id) {
    return {
      court,
      member: {
        id: existing.id,
        court_id: existing.court_id,
        user_id: existing.user_id,
        rank: existing.rank,
        standing: existing.standing,
        role: existing.role,
        joined_at: existing.joined_at,
      },
    };
  }

  const db = getDb();
  const rows = await db`
    INSERT INTO court_members (court_id, user_id, rank, standing, role)
    VALUES (${court.id}, ${input.userId}, 'serf', 0, 'vassal')
    RETURNING id, court_id, user_id, rank, standing, role, joined_at
  `;
  const member = rows[0] as DbCourtMember;
  await ensureScoreRow(court.id, input.userId);
  return { court, member };
}

export async function updateCourtSettings(
  lordUserId: string,
  patch: {
    theme?: HallTheme;
    widget?: HallWidget;
    tagline?: string;
    name?: string;
  },
): Promise<DbCourt | null> {
  await ensureSchema();
  const court = await getCourtByLord(lordUserId);
  if (!court) return null;

  const theme = patch.theme ?? court.theme;
  const widget = patch.widget ?? court.widget;
  const tagline =
    patch.tagline !== undefined
      ? patch.tagline.trim().slice(0, 120)
      : court.tagline;
  const name =
    patch.name !== undefined ? patch.name.trim().slice(0, 80) : court.name;

  const db = getDb();
  const rows = await db`
    UPDATE courts
    SET theme = ${theme},
        widget = ${widget},
        tagline = ${tagline},
        name = ${name}
    WHERE id = ${court.id} AND lord_user_id = ${lordUserId}
    RETURNING id, lord_user_id, slug, name, theme, widget, tagline, created_at
  `;
  return (rows[0] as DbCourt | undefined) ?? null;
}

export async function listLeaderboard(
  courtId: string,
): Promise<DbCourtMember[]> {
  await ensureSchema();
  const db = getDb();
  const rows = await db`
    SELECT m.id, m.court_id, m.user_id, m.rank, m.standing, m.role, m.joined_at,
           u.name, u.avatar_url, u.x_username
    FROM court_members m
    JOIN users u ON u.id = m.user_id
    WHERE m.court_id = ${courtId}
    ORDER BY
      CASE m.role WHEN 'lord' THEN 0 ELSE 1 END,
      m.standing DESC,
      m.joined_at ASC
  `;
  return rows as DbCourtMember[];
}

export async function listPlaylist(courtId: string): Promise<DbPlaylistTrack[]> {
  await ensureSchema();
  const db = getDb();
  const rows = await db`
    SELECT t.id, t.court_id, t.user_id, t.title, t.artist, t.url, t.created_at, u.name
    FROM hall_playlist_tracks t
    JOIN users u ON u.id = t.user_id
    WHERE t.court_id = ${courtId}
    ORDER BY t.created_at DESC
    LIMIT 40
  `;
  return rows as DbPlaylistTrack[];
}

export async function addPlaylistTrack(input: {
  courtId: string;
  userId: string;
  title: string;
  artist?: string;
  url?: string;
}): Promise<DbPlaylistTrack> {
  await ensureSchema();
  const title = input.title.trim().slice(0, 120);
  if (!title) throw new Error("Song title required.");
  const url = input.url?.trim()
    ? safeHttpUrl(input.url)
    : "";
  if (input.url?.trim() && !url) {
    throw new Error("Track link must be http(s).");
  }
  const db = getDb();
  const rows = await db`
    INSERT INTO hall_playlist_tracks (court_id, user_id, title, artist, url)
    VALUES (
      ${input.courtId},
      ${input.userId},
      ${title},
      ${(input.artist ?? "").trim().slice(0, 80)},
      ${url || ""}
    )
    RETURNING id, court_id, user_id, title, artist, url, created_at
  `;
  return rows[0] as DbPlaylistTrack;
}

export async function listMoodPins(courtId: string): Promise<DbMoodPin[]> {
  await ensureSchema();
  const db = getDb();
  const rows = await db`
    SELECT p.id, p.court_id, p.user_id, p.title, p.image_url, p.source_url, p.created_at, u.name
    FROM hall_mood_pins p
    JOIN users u ON u.id = p.user_id
    WHERE p.court_id = ${courtId}
    ORDER BY p.created_at DESC
    LIMIT 40
  `;
  return rows as DbMoodPin[];
}

export async function addMoodPin(input: {
  courtId: string;
  userId: string;
  title?: string;
  imageUrl: string;
  sourceUrl?: string;
}): Promise<DbMoodPin> {
  await ensureSchema();
  const imageUrl = safeHttpUrl(input.imageUrl);
  if (!imageUrl) {
    throw new Error("Image URL required (https link from Pinterest or elsewhere).");
  }
  const sourceUrl = input.sourceUrl?.trim()
    ? safeHttpUrl(input.sourceUrl)
    : "";
  if (input.sourceUrl?.trim() && !sourceUrl) {
    throw new Error("Source link must be http(s).");
  }
  const db = getDb();
  const rows = await db`
    INSERT INTO hall_mood_pins (court_id, user_id, title, image_url, source_url)
    VALUES (
      ${input.courtId},
      ${input.userId},
      ${(input.title ?? "").trim().slice(0, 80)},
      ${imageUrl},
      ${sourceUrl || ""}
    )
    RETURNING id, court_id, user_id, title, image_url, source_url, created_at
  `;
  return rows[0] as DbMoodPin;
}

export async function getHallBundle(slug: string) {
  const court = await getCourtBySlug(slug);
  if (!court) return null;

  const season = await ensureActiveSeason(court.id, court.lord_user_id);
  const [leaderboard, playlist, moodboard, scoreboard, lordRows] =
    await Promise.all([
      listLeaderboard(court.id),
      court.widget === "playlist" ? listPlaylist(court.id) : Promise.resolve([]),
      court.widget === "moodboard" ? listMoodPins(court.id) : Promise.resolve([]),
      listScoreboard(season.id),
      (async () => {
        const db = getDb();
        return db`
          SELECT id, name, avatar_url, x_username
          FROM users WHERE id = ${court.lord_user_id} LIMIT 1
        `;
      })(),
    ]);

  // Ensure every member has a score row.
  await Promise.all(
    leaderboard.map((m) => ensureScoreRowForSeason(season.id, m.user_id)),
  );
  const scores =
    scoreboard.length === leaderboard.length
      ? scoreboard
      : await listScoreboard(season.id);

  const lord = lordRows[0] as
    | {
        id: string;
        name: string;
        avatar_url: string | null;
        x_username: string | null;
      }
    | undefined;

  return {
    court,
    leaderboard,
    playlist,
    moodboard,
    season,
    scoreboard: scores,
    lord: lord ?? null,
  };
}

export type DbSeason = {
  id: string;
  court_id: string;
  title: string;
  target_replies: number;
  target_reposts: number;
  target_mentions: number;
  starts_at: string;
  ends_at: string;
};

export type DbSeasonScore = {
  user_id: string;
  name: string;
  avatar_url: string | null;
  rank: CourtRank;
  role: "lord" | "vassal";
  standing: number;
  replies: number;
  reposts: number;
  mentions: number;
};

async function ensureActiveSeason(
  courtId: string,
  lordUserId: string,
): Promise<DbSeason> {
  await ensureSchema();
  const db = getDb();
  const existing = await db`
    SELECT id, court_id, title, target_replies, target_reposts, target_mentions,
           starts_at, ends_at
    FROM court_seasons
    WHERE court_id = ${courtId} AND ends_at > NOW()
    ORDER BY starts_at DESC
    LIMIT 1
  `;
  if (existing[0]) {
    await ensureScoreRowForSeason(String(existing[0].id), lordUserId);
    return existing[0] as DbSeason;
  }

  const rows = await db`
    INSERT INTO court_seasons (court_id, title)
    VALUES (${courtId}, 'Season of Service')
    RETURNING id, court_id, title, target_replies, target_reposts, target_mentions,
              starts_at, ends_at
  `;
  const season = rows[0] as DbSeason;
  await ensureScoreRowForSeason(season.id, lordUserId);
  return season;
}

async function ensureScoreRow(courtId: string, userId: string) {
  const season = await ensureActiveSeason(courtId, userId);
  await ensureScoreRowForSeason(season.id, userId);
}

async function ensureScoreRowForSeason(seasonId: string, userId: string) {
  const db = getDb();
  await db`
    INSERT INTO season_scores (season_id, user_id)
    VALUES (${seasonId}, ${userId})
    ON CONFLICT (season_id, user_id) DO NOTHING
  `;
}

export async function listScoreboard(seasonId: string): Promise<DbSeasonScore[]> {
  await ensureSchema();
  const db = getDb();
  const rows = await db`
    SELECT m.user_id, u.name, u.avatar_url, m.rank, m.role, m.standing,
           COALESCE(s.replies, 0) AS replies,
           COALESCE(s.reposts, 0) AS reposts,
           COALESCE(s.mentions, 0) AS mentions
    FROM court_members m
    JOIN users u ON u.id = m.user_id
    JOIN court_seasons cs ON cs.id = ${seasonId} AND cs.court_id = m.court_id
    LEFT JOIN season_scores s ON s.season_id = cs.id AND s.user_id = m.user_id
    ORDER BY
      CASE m.role WHEN 'lord' THEN 0 ELSE 1 END,
      (COALESCE(s.replies,0) + COALESCE(s.reposts,0) * 2 + COALESCE(s.mentions,0) * 3) DESC,
      m.standing DESC
  `;
  return rows as DbSeasonScore[];
}

export async function updateSeasonTargets(
  lordUserId: string,
  patch: {
    title?: string;
    targetReplies?: number;
    targetReposts?: number;
    targetMentions?: number;
  },
): Promise<DbSeason | null> {
  await ensureSchema();
  const court = await getCourtByLord(lordUserId);
  if (!court) return null;
  const season = await ensureActiveSeason(court.id, lordUserId);
  const db = getDb();
  const title = (patch.title ?? season.title).trim().slice(0, 80) || season.title;
  const targetReplies = clampTarget(
    patch.targetReplies ?? season.target_replies,
  );
  const targetReposts = clampTarget(
    patch.targetReposts ?? season.target_reposts,
  );
  const targetMentions = clampTarget(
    patch.targetMentions ?? season.target_mentions,
  );
  const rows = await db`
    UPDATE court_seasons
    SET title = ${title},
        target_replies = ${targetReplies},
        target_reposts = ${targetReposts},
        target_mentions = ${targetMentions}
    WHERE id = ${season.id}
    RETURNING id, court_id, title, target_replies, target_reposts, target_mentions,
              starts_at, ends_at
  `;
  return (rows[0] as DbSeason | undefined) ?? null;
}

function clampTarget(n: number) {
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(9999, Math.round(n)));
}

/** Demo/dev helper: bump a member's season score (until X sync exists). */
export async function bumpSeasonScore(input: {
  courtId: string;
  userId: string;
  replies?: number;
  reposts?: number;
  mentions?: number;
}): Promise<DbSeasonScore | null> {
  const season = await ensureActiveSeason(input.courtId, input.userId);
  await ensureScoreRowForSeason(season.id, input.userId);
  const db = getDb();
  await db`
    UPDATE season_scores
    SET replies = replies + ${input.replies ?? 0},
        reposts = reposts + ${input.reposts ?? 0},
        mentions = mentions + ${input.mentions ?? 0}
    WHERE season_id = ${season.id} AND user_id = ${input.userId}
  `;
  const standing =
    (input.replies ?? 0) + (input.reposts ?? 0) * 2 + (input.mentions ?? 0) * 3;
  if (standing > 0) {
    await db`
      UPDATE court_members
      SET standing = standing + ${standing}
      WHERE court_id = ${input.courtId} AND user_id = ${input.userId}
    `;
  }
  const board = await listScoreboard(season.id);
  return board.find((r) => r.user_id === input.userId) ?? null;
}
