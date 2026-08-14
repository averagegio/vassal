/**
 * Seed investor demo cast into Neon.
 *
 * Usage: npm run demo:seed
 * Requires DATABASE_URL (e.g. via `npx vercel env pull .env.local`).
 *
 * Idempotent on demo emails (*@demo.vassal). Safe to re-run.
 */

import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvFile(name) {
  const path = join(root, name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i <= 0) continue;
    const key = trimmed.slice(0, i).trim();
    let value = trimmed.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const PASSWORD = "vassal-demo";

const CAST = {
  rowan: {
    name: "Lord Rowan",
    handle: "rowan",
    holding: "fan",
    decree:
      "Season of Service is live. Speak in the hall, cheer your peers, climb the board — Steward drafts the weekly wrap; I seal it.",
    avatar: "/demo/cast/cast_lord_rowan.webp",
  },
  mira: {
    name: "Ser Mira",
    handle: "mira",
    holding: "fan",
    decree: "",
    avatar: "/demo/cast/cast_ser_mira.webp",
    rank: "count",
    standing: 820,
  },
  cass: {
    name: "Baron Cass",
    handle: "cass",
    holding: "fan",
    decree: "",
    avatar: "/demo/cast/cast_baron_cass.webp",
    rank: "baron",
    standing: 410,
  },
  wren: {
    name: "Serf Wren",
    handle: "wren",
    holding: "fan",
    decree: "",
    avatar: "/demo/cast/cast_serf_wren.webp",
    rank: "serf",
    standing: 40,
  },
  astra: {
    name: "Lady Astra",
    handle: "astra",
    holding: "estate",
    decree:
      "Quiet hours 10pm. Photo any repair before you text me — Steward files it as a petition I seal.",
    avatar: "/demo/cast/cast_lady_astra.webp",
  },
  jules: {
    name: "Jules Okonkwo",
    handle: "jules",
    holding: "estate",
    decree: "",
    avatar: "/demo/cast/cast_tenant_jules.webp",
  },
  theo: {
    name: "Theo Marsh",
    handle: "theo",
    holding: "estate",
    decree: "",
    avatar: "/demo/cast/cast_tenant_theo.webp",
  },
};

function resolveDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    null
  );
}

async function upsertUser(sql, key, passwordHash) {
  const c = CAST[key];
  const email = `${c.handle}@demo.vassal`;
  const rows = await sql`
    INSERT INTO users (name, email, password_hash, holding, decree, x_username, avatar_url)
    VALUES (${c.name}, ${email}, ${passwordHash}, ${c.holding}, ${c.decree}, ${c.handle}, ${c.avatar})
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      password_hash = EXCLUDED.password_hash,
      holding = EXCLUDED.holding,
      decree = EXCLUDED.decree,
      x_username = EXCLUDED.x_username,
      avatar_url = EXCLUDED.avatar_url
    RETURNING id, email, name
  `;
  return rows[0];
}

async function main() {
  const url = resolveDatabaseUrl();
  if (!url) {
    console.error("No DATABASE_URL — pull env first: npx vercel env pull .env.local");
    process.exit(1);
  }

  const sql = neon(url);
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  console.log("Seeding demo cast…");

  const users = {};
  for (const key of Object.keys(CAST)) {
    users[key] = await upsertUser(sql, key, passwordHash);
    console.log(`  user ${users[key].email}`);
  }

  // Rowan Court — prefer updating Rowan's existing hall, else claim slug
  const existingCourt = await sql`
    SELECT id FROM courts
    WHERE lord_user_id = ${users.rowan.id} OR slug = 'rowan-court'
    ORDER BY CASE WHEN lord_user_id = ${users.rowan.id} THEN 0 ELSE 1 END
    LIMIT 1
  `;
  let court;
  if (existingCourt[0]) {
    const updated = await sql`
      UPDATE courts SET
        lord_user_id = ${users.rowan.id},
        slug = 'rowan-court',
        name = 'Rowan Court',
        theme = 'crimson',
        widget = 'playlist',
        tagline = 'Loyalty with a soundtrack.'
      WHERE id = ${existingCourt[0].id}
      RETURNING id, slug
    `;
    court = updated[0];
  } else {
    const created = await sql`
      INSERT INTO courts (lord_user_id, slug, name, theme, widget, tagline)
      VALUES (
        ${users.rowan.id},
        'rowan-court',
        'Rowan Court',
        'crimson',
        'playlist',
        'Loyalty with a soundtrack.'
      )
      RETURNING id, slug
    `;
    court = created[0];
  }

  // Ensure lord unique: if another court owned by rowan, keep this slug as primary
  await sql`
    INSERT INTO court_members (court_id, user_id, rank, standing, role)
    VALUES (${court.id}, ${users.rowan.id}, 'duke', 1000, 'lord')
    ON CONFLICT (user_id) DO UPDATE SET
      court_id = EXCLUDED.court_id,
      rank = EXCLUDED.rank,
      standing = EXCLUDED.standing,
      role = EXCLUDED.role
  `;

  for (const key of ["mira", "cass", "wren"]) {
    const c = CAST[key];
    await sql`
      INSERT INTO court_members (court_id, user_id, rank, standing, role)
      VALUES (${court.id}, ${users[key].id}, ${c.rank}, ${c.standing}, 'vassal')
      ON CONFLICT (user_id) DO UPDATE SET
        court_id = EXCLUDED.court_id,
        rank = EXCLUDED.rank,
        standing = EXCLUDED.standing,
        role = 'vassal'
    `;
  }

  // Season
  const seasonRows = await sql`
    SELECT id FROM court_seasons WHERE court_id = ${court.id} ORDER BY created_at DESC LIMIT 1
  `;
  let seasonId = seasonRows[0]?.id;
  if (!seasonId) {
    const created = await sql`
      INSERT INTO court_seasons (court_id, title, target_replies, target_reposts, target_mentions)
      VALUES (${court.id}, 'Season of Service', 40, 30, 25)
      RETURNING id
    `;
    seasonId = created[0].id;
  }

  await sql`
    INSERT INTO season_scores (season_id, user_id, replies, reposts, mentions)
    VALUES
      (${seasonId}, ${users.mira.id}, 28, 22, 18),
      (${seasonId}, ${users.cass.id}, 14, 19, 9),
      (${seasonId}, ${users.wren.id}, 2, 1, 0),
      (${seasonId}, ${users.rowan.id}, 6, 4, 3)
    ON CONFLICT (season_id, user_id) DO UPDATE SET
      replies = EXCLUDED.replies,
      reposts = EXCLUDED.reposts,
      mentions = EXCLUDED.mentions
  `;

  // Clear + reseed hall comments for demo court (demo-only authors)
  const demoIds = [
    users.rowan.id,
    users.mira.id,
    users.cass.id,
    users.wren.id,
  ];
  await sql`
    DELETE FROM hall_comment_cheers
    WHERE comment_id IN (SELECT id FROM hall_comments WHERE court_id = ${court.id})
  `;
  await sql`DELETE FROM hall_comments WHERE court_id = ${court.id}`;

  const miraPost = await sql`
    INSERT INTO hall_comments (court_id, user_id, body)
    VALUES (${court.id}, ${users.mira.id}, ${"Board is heating up. Who’s taking Words tonight?"})
    RETURNING id
  `;
  const cassPost = await sql`
    INSERT INTO hall_comments (court_id, user_id, body)
    VALUES (${court.id}, ${users.cass.id}, ${"Queued ‘Ember Gate’ for the booth. Cheer if you’re in the keep."})
    RETURNING id
  `;
  await sql`
    INSERT INTO hall_comments (court_id, user_id, body)
    VALUES (${court.id}, ${users.wren.id}, ${"Just sealed in. Glad to be under the banner."})
  `;
  await sql`
    INSERT INTO hall_comments (court_id, user_id, parent_id, body)
    VALUES (${court.id}, ${users.rowan.id}, ${miraPost[0].id}, ${"Steward is drafting Friday’s wrap. I’ll seal before stream."})
  `;
  await sql`
    INSERT INTO hall_comment_cheers (comment_id, user_id)
    VALUES
      (${miraPost[0].id}, ${users.cass.id}),
      (${miraPost[0].id}, ${users.wren.id}),
      (${cassPost[0].id}, ${users.mira.id}),
      (${cassPost[0].id}, ${users.rowan.id})
    ON CONFLICT DO NOTHING
  `;

  // Playlist track
  await sql`DELETE FROM hall_playlist_tracks WHERE court_id = ${court.id}`;
  await sql`
    INSERT INTO hall_playlist_tracks (court_id, user_id, title, artist, url)
    VALUES (
      ${court.id},
      ${users.cass.id},
      'Ember Gate',
      'Baron Cass',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    )
  `;

  // Petitions on Rowan's holding
  await sql`DELETE FROM petitions WHERE user_id = ${users.rowan.id}`;
  await sql`
    INSERT INTO petitions (user_id, from_name, rank, ask, status)
    VALUES (
      ${users.rowan.id},
      ${CAST.mira.name},
      'count',
      ${"Seal a collab shoutout on Friday’s stream — I’ve queued the drop."},
      'open'
    )
  `;

  // Decree feed for Rowan
  await sql`DELETE FROM decrees WHERE user_id = ${users.rowan.id}`;
  await sql`
    INSERT INTO decrees (user_id, body)
    VALUES (${users.rowan.id}, ${CAST.rowan.decree})
  `;
  await sql`DELETE FROM decrees WHERE user_id = ${users.astra.id}`;
  await sql`
    INSERT INTO decrees (user_id, body)
    VALUES (${users.astra.id}, ${CAST.astra.decree})
  `;

  // Estate tenants under Astra
  await sql`DELETE FROM tenants WHERE user_id = ${users.astra.id}`;
  await sql`
    INSERT INTO tenants (user_id, name, rank, standing, status)
    VALUES
      (${users.astra.id}, ${CAST.jules.name}, 'returner', 92, 'returner'),
      (${users.astra.id}, ${CAST.theo.name}, 'leaseholder', 54, 'chill risk · 28d')
  `;
  await sql`DELETE FROM petitions WHERE user_id = ${users.astra.id}`;
  await sql`
    INSERT INTO petitions (user_id, from_name, rank, ask, status)
    VALUES (
      ${users.astra.id},
      ${CAST.jules.name},
      'returner',
      ${"Bathroom fan rattling — photo attached. Flexible after 5pm."},
      'open'
    )
  `;

  // Scroll invite token for Wren-style join demo
  const token = `demo-${randomBytes(6).toString("hex")}`;
  await sql`DELETE FROM court_scrolls WHERE court_id = ${court.id} AND kind = 'vassal'`;
  await sql`
    INSERT INTO court_scrolls (
      token, kind, court_id, author_user_id, title, greeting, body, sign_off
    )
    VALUES (
      ${token},
      'vassal',
      ${court.id},
      ${users.rowan.id},
      ${"A summons to Rowan Court"},
      ${"To the one who would swear fealty,"},
      ${"Lord Rowan summons you to Rowan Court. Climb the season board, speak in the hall, and keep loyalty warm between streams."},
      ${"By the seal of Lord Rowan, Lord of the hall"}
    )
  `;

  console.log("\nDemo cast ready.");
  console.log(`  Password for all: ${PASSWORD}`);
  console.log(`  Hall: /hall/rowan-court`);
  console.log(`  Scroll: /scroll/${token}`);
  console.log(`  Cast sheet: /demo/cast`);
  console.log(`  Logins: ${demoIds.length} fan + estate users @demo.vassal`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
