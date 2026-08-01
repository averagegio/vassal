import { randomBytes } from "crypto";
import { ensureSchema, getDb } from "./db";
import {
  getCourtByLord,
  getCourtBySlug,
  getMembershipForUser,
} from "./courts";
import {
  type ScrollKind,
  type ScrollPublic,
} from "./scroll-types";

export type { ScrollKind, ScrollPublic } from "./scroll-types";
export { SCROLL_KINDS } from "./scroll-types";

export type DbScroll = {
  id: string;
  token: string;
  kind: ScrollKind;
  court_id: string | null;
  author_user_id: string;
  title: string;
  greeting: string;
  body: string;
  sign_off: string;
  nominee_name: string;
  created_at: string;
};

function newToken() {
  return randomBytes(9).toString("base64url");
}

function trimField(value: string | undefined, max: number) {
  return (value ?? "").trim().slice(0, max);
}

export function defaultScrollCopy(input: {
  kind: ScrollKind;
  authorName: string;
  courtName?: string;
  nomineeName?: string;
}): {
  title: string;
  greeting: string;
  body: string;
  signOff: string;
} {
  if (input.kind === "vassal") {
    const hall = input.courtName || "our hall";
    return {
      title: `A summons to ${hall}`,
      greeting: "To a prospective vassal,",
      body: `You are invited to swear fealty and join ${hall}. Stand with the retinue, share the season board, and claim your place in the court.`,
      signOff: `By the seal of ${input.authorName}, Lord of the hall`,
    };
  }

  const nominee = input.nomineeName?.trim();
  return {
    title: "A nomination for Lordship",
    greeting: nominee ? `To ${nominee},` : "To a worthy creator,",
    body: `${input.authorName} nominates you to open a Fan Court as Lord. Raise a hall, gather vassals, and set the tone of your own court.`,
    signOff: `With respect — ${input.authorName}`,
  };
}

export async function createScroll(input: {
  authorUserId: string;
  kind: ScrollKind;
  courtSlug?: string;
  title?: string;
  greeting?: string;
  body?: string;
  signOff?: string;
  nomineeName?: string;
}): Promise<ScrollPublic> {
  await ensureSchema();
  const membership = await getMembershipForUser(input.authorUserId);
  const db = getDb();

  const authorRows = await db`
    SELECT id, name, avatar_url, x_username
    FROM users WHERE id = ${input.authorUserId} LIMIT 1
  `;
  const author = authorRows[0] as
    | {
        id: string;
        name: string;
        avatar_url: string | null;
        x_username: string | null;
      }
    | undefined;
  if (!author) throw new Error("Author not found.");

  let courtId: string | null = null;
  let courtName: string | undefined;

  if (input.kind === "vassal") {
    if (!membership || membership.role !== "lord") {
      throw new Error("Only a Lord can send vassal summons.");
    }
    const bySlug = input.courtSlug
      ? await getCourtBySlug(input.courtSlug)
      : null;
    const court =
      bySlug && bySlug.lord_user_id === input.authorUserId
        ? bySlug
        : await getCourtByLord(input.authorUserId);
    if (!court) {
      throw new Error("Your hall is required for a vassal summons.");
    }
    courtId = court.id;
    courtName = court.name;
  } else {
    // Nominations can come from any sworn vassal (or a lord recommending another creator).
    if (!membership) {
      throw new Error("Swear into a court before nominating a Lord.");
    }
    courtId = membership.court_id;
    courtName = membership.court_name;
  }

  const defaults = defaultScrollCopy({
    kind: input.kind,
    authorName: author.name,
    courtName,
    nomineeName: input.nomineeName,
  });

  const title = trimField(input.title, 120) || defaults.title;
  const greeting = trimField(input.greeting, 120) || defaults.greeting;
  const body = trimField(input.body, 800) || defaults.body;
  const signOff = trimField(input.signOff, 160) || defaults.signOff;
  const nomineeName = trimField(input.nomineeName, 80);

  let token = newToken();
  for (let i = 0; i < 5; i++) {
    try {
      const rows = await db`
        INSERT INTO court_scrolls (
          token, kind, court_id, author_user_id,
          title, greeting, body, sign_off, nominee_name
        )
        VALUES (
          ${token},
          ${input.kind},
          ${courtId},
          ${input.authorUserId},
          ${title},
          ${greeting},
          ${body},
          ${signOff},
          ${nomineeName}
        )
        RETURNING id, token, kind, court_id, author_user_id,
                  title, greeting, body, sign_off, nominee_name, created_at
      `;
      const scroll = rows[0] as DbScroll;
      const publicScroll = await getScrollByToken(scroll.token);
      if (!publicScroll) throw new Error("Could not load scroll.");
      return publicScroll;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/unique|duplicate/i.test(message) && i < 4) {
        token = newToken();
        continue;
      }
      throw err;
    }
  }
  throw new Error("Could not mint scroll token.");
}

export async function getScrollByToken(
  token: string,
): Promise<ScrollPublic | null> {
  await ensureSchema();
  const clean = token.trim();
  if (!clean) return null;
  const db = getDb();
  const rows = await db`
    SELECT s.id, s.token, s.kind, s.court_id, s.author_user_id,
           s.title, s.greeting, s.body, s.sign_off, s.nominee_name, s.created_at,
           u.name AS author_name, u.avatar_url AS author_avatar,
           u.x_username AS author_x,
           c.id AS court_row_id, c.slug AS court_slug, c.name AS court_name,
           c.tagline AS court_tagline
    FROM court_scrolls s
    JOIN users u ON u.id = s.author_user_id
    LEFT JOIN courts c ON c.id = s.court_id
    WHERE s.token = ${clean}
    LIMIT 1
  `;
  const row = rows[0] as
    | {
        token: string;
        kind: ScrollKind;
        title: string;
        greeting: string;
        body: string;
        sign_off: string;
        nominee_name: string;
        created_at: string;
        author_user_id: string;
        author_name: string;
        author_avatar: string | null;
        author_x: string | null;
        court_row_id: string | null;
        court_slug: string | null;
        court_name: string | null;
        court_tagline: string | null;
      }
    | undefined;
  if (!row) return null;

  return {
    token: row.token,
    kind: row.kind,
    title: row.title,
    greeting: row.greeting,
    body: row.body,
    signOff: row.sign_off,
    nomineeName: row.nominee_name,
    createdAt: row.created_at,
    author: {
      id: row.author_user_id,
      name: row.author_name,
      avatarUrl: row.author_avatar,
      xUsername: row.author_x,
    },
    court:
      row.court_row_id && row.court_slug && row.court_name
        ? {
            id: row.court_row_id,
            slug: row.court_slug,
            name: row.court_name,
            tagline: row.court_tagline || "",
          }
        : null,
  };
}

export async function listScrollsForAuthor(
  authorUserId: string,
  kind?: ScrollKind,
): Promise<ScrollPublic[]> {
  await ensureSchema();
  const db = getDb();
  const rows = kind
    ? await db`
        SELECT s.token
        FROM court_scrolls s
        WHERE s.author_user_id = ${authorUserId} AND s.kind = ${kind}
        ORDER BY s.created_at DESC
        LIMIT 20
      `
    : await db`
        SELECT s.token
        FROM court_scrolls s
        WHERE s.author_user_id = ${authorUserId}
        ORDER BY s.created_at DESC
        LIMIT 20
      `;
  const scrolls: ScrollPublic[] = [];
  for (const row of rows as Array<{ token: string }>) {
    const scroll = await getScrollByToken(row.token);
    if (scroll) scrolls.push(scroll);
  }
  return scrolls;
}
