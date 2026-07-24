import bcrypt from "bcryptjs";
import {
  ensureSchema,
  getDb,
  type DbPetition,
  type DbTenant,
  type DbUser,
} from "./db";

const SELECT_USER = `
  id, name, email, password_hash, holding, decree,
  x_id, x_username, avatar_url, header_url, created_at
`;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  await ensureSchema();
  const db = getDb();
  const rows = await db.query(
    `SELECT ${SELECT_USER} FROM users WHERE email = $1 LIMIT 1`,
    [email.toLowerCase()],
  );
  return (rows[0] as DbUser | undefined) ?? null;
}

export async function findUserById(id: string): Promise<DbUser | null> {
  await ensureSchema();
  const db = getDb();
  const rows = await db.query(
    `SELECT ${SELECT_USER} FROM users WHERE id = $1 LIMIT 1`,
    [id],
  );
  return (rows[0] as DbUser | undefined) ?? null;
}

export async function findUserByXId(xId: string): Promise<DbUser | null> {
  await ensureSchema();
  const db = getDb();
  const rows = await db.query(
    `SELECT ${SELECT_USER} FROM users WHERE x_id = $1 LIMIT 1`,
    [xId],
  );
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
      ? "Your court is open."
      : "Your freehold is open.";

  const rows = await db.query(
    `INSERT INTO users (name, email, password_hash, holding, decree)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${SELECT_USER}`,
    [
      input.name.trim(),
      input.email.trim().toLowerCase(),
      passwordHash,
      input.holding,
      decree,
    ],
  );
  return rows[0] as DbUser;
}

export async function upsertUserFromX(input: {
  xId: string;
  username: string;
  name: string;
  avatarUrl?: string | null;
  holding: "fan" | "estate";
}): Promise<DbUser> {
  await ensureSchema();
  const existing = await findUserByXId(input.xId);
  const db = getDb();

  if (existing) {
    const rows = await db.query(
      `UPDATE users
       SET name = $1,
           x_username = $2,
           avatar_url = COALESCE($3, avatar_url)
       WHERE x_id = $4
       RETURNING ${SELECT_USER}`,
      [
        input.name || existing.name,
        input.username,
        input.avatarUrl ?? null,
        input.xId,
      ],
    );
    return rows[0] as DbUser;
  }

  const email = `x_${input.xId}@vassal.x`;
  const decree =
    input.holding === "fan"
      ? "Your court is open."
      : "Your freehold is open.";

  const rows = await db.query(
    `INSERT INTO users (
       name, email, password_hash, holding, decree,
       x_id, x_username, avatar_url
     ) VALUES ($1, $2, NULL, $3, $4, $5, $6, $7)
     RETURNING ${SELECT_USER}`,
    [
      input.name || input.username,
      email,
      input.holding,
      decree,
      input.xId,
      input.username,
      input.avatarUrl ?? null,
    ],
  );
  return rows[0] as DbUser;
}

export async function updateProfileImage(
  userId: string,
  kind: "avatar" | "header",
  dataUrl: string | null,
) {
  await ensureSchema();
  const db = getDb();
  const column = kind === "avatar" ? "avatar_url" : "header_url";
  const rows = await db.query(
    `UPDATE users SET ${column} = $1 WHERE id = $2 RETURNING ${SELECT_USER}`,
    [dataUrl, userId],
  );
  return (rows[0] as DbUser | undefined) ?? null;
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
