import bcrypt from "bcryptjs";
import {
  ensureSchema,
  getDb,
  type DbPetition,
  type DbTenant,
  type DbUser,
} from "./db";
import { FAN_PETITIONS, RE_PETITIONS } from "./features";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  await ensureSchema();
  const db = getDb();
  const rows = await db`
    SELECT id, name, email, password_hash, holding, decree, created_at
    FROM users
    WHERE email = ${email.toLowerCase()}
    LIMIT 1
  `;
  return (rows[0] as DbUser | undefined) ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  holding: "fan" | "estate";
}): Promise<DbUser> {
  await ensureSchema();
  const db = getDb();
  const passwordHash = await hashPassword(input.password);
  const decree =
    input.holding === "fan"
      ? "Welcome to the court. Retainers gather at dusk."
      : "House law stands. Repairs sealed by rank.";

  const rows = await db`
    INSERT INTO users (name, email, password_hash, holding, decree)
    VALUES (
      ${input.name.trim()},
      ${input.email.trim().toLowerCase()},
      ${passwordHash},
      ${input.holding},
      ${decree}
    )
    RETURNING id, name, email, password_hash, holding, decree, created_at
  `;
  const user = rows[0] as DbUser;
  await seedHolding(user.id, input.holding);
  return user;
}

async function seedHolding(userId: string, holding: "fan" | "estate") {
  const db = getDb();
  const petitions = holding === "fan" ? FAN_PETITIONS : RE_PETITIONS;
  for (const p of petitions) {
    await db`
      INSERT INTO petitions (user_id, from_name, rank, ask, status)
      VALUES (${userId}, ${p.from}, ${p.rank}, ${p.ask}, ${p.status})
    `;
  }

  const tenants =
    holding === "fan"
      ? [
          ["Mira of the North", "Freeholder", 91, "Active"],
          ["Cole the Steady", "Serf", 64, "Streak"],
          ["Lord Ash", "Retainer", 97, "Audience"],
          ["Rin Vale", "Serf", 41, "Cooling"],
        ]
      : [
          ["Elena · 2B", "High", 94, "Repair open"],
          ["Jordan · 4A", "Renewal", 88, "Guest ok"],
          ["Maya · Pine", "Guest", 70, "Checked out"],
          ["Sam · 5C", "At risk", 52, "Chill"],
        ];

  for (const [name, rank, standing, status] of tenants) {
    await db`
      INSERT INTO tenants (user_id, name, rank, standing, status)
      VALUES (${userId}, ${name}, ${rank}, ${standing}, ${status})
    `;
  }
}

export async function listPetitions(userId: string): Promise<DbPetition[]> {
  await ensureSchema();
  const db = getDb();
  const rows = await db`
    SELECT id, user_id, from_name, rank, ask, status, created_at
    FROM petitions
    WHERE user_id = ${userId}
    ORDER BY created_at ASC
  `;
  return rows as DbPetition[];
}

export async function updatePetitionStatus(
  userId: string,
  petitionId: string,
  status: DbPetition["status"],
) {
  await ensureSchema();
  const db = getDb();
  const rows = await db`
    UPDATE petitions
    SET status = ${status}
    WHERE id = ${petitionId} AND user_id = ${userId}
    RETURNING id, user_id, from_name, rank, ask, status, created_at
  `;
  return (rows[0] as DbPetition | undefined) ?? null;
}

export async function listTenants(userId: string): Promise<DbTenant[]> {
  await ensureSchema();
  const db = getDb();
  const rows = await db`
    SELECT id, user_id, name, rank, standing, status, created_at
    FROM tenants
    WHERE user_id = ${userId}
    ORDER BY standing DESC
  `;
  return rows as DbTenant[];
}

export async function getDashboardStats(userId: string) {
  await ensureSchema();
  const db = getDb();
  const [tenantCount] = await db`
    SELECT COUNT(*)::int AS count FROM tenants WHERE user_id = ${userId}
  `;
  const [openCount] = await db`
    SELECT COUNT(*)::int AS count FROM petitions
    WHERE user_id = ${userId} AND status = 'open'
  `;
  const [standing] = await db`
    SELECT COALESCE(ROUND(AVG(standing)), 0)::int AS avg
    FROM tenants WHERE user_id = ${userId}
  `;
  return {
    tenants: Number(tenantCount?.count ?? 0),
    openPetitions: Number(openCount?.count ?? 0),
    standingAvg: Number(standing?.avg ?? 0),
  };
}

export async function getUserDecree(userId: string) {
  await ensureSchema();
  const db = getDb();
  const rows = await db`
    SELECT decree FROM users WHERE id = ${userId} LIMIT 1
  `;
  return String(rows[0]?.decree ?? "");
}

export async function updateDecree(userId: string, decree: string) {
  await ensureSchema();
  const db = getDb();
  await db`
    UPDATE users SET decree = ${decree.trim()} WHERE id = ${userId}
  `;
}
