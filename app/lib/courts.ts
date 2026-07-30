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
  return { court, member: rows[0] as DbCourtMember };
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
  const [leaderboard, playlist, moodboard, lordRows] = await Promise.all([
    listLeaderboard(court.id),
    court.widget === "playlist" ? listPlaylist(court.id) : Promise.resolve([]),
    court.widget === "moodboard" ? listMoodPins(court.id) : Promise.resolve([]),
    (async () => {
      const db = getDb();
      return db`
        SELECT id, name, avatar_url, x_username
        FROM users WHERE id = ${court.lord_user_id} LIMIT 1
      `;
    })(),
  ]);
  const lord = lordRows[0] as
    | {
        id: string;
        name: string;
        avatar_url: string | null;
        x_username: string | null;
      }
    | undefined;

  return { court, leaderboard, playlist, moodboard, lord: lord ?? null };
}
