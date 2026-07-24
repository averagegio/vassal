import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join } from "path";

let sql: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

/**
 * Resolve the pooled connection string from Vercel Neon / Neon Marketplace
 * env vars (and legacy Vercel Postgres aliases).
 */
export function resolveDatabaseUrl(): string | null {
  const direct =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    null;

  if (direct) return direct;

  const host = process.env.PGHOST || process.env.POSTGRES_HOST;
  const user = process.env.PGUSER || process.env.POSTGRES_USER;
  const password = process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD;
  const database = process.env.PGDATABASE || process.env.POSTGRES_DATABASE;
  if (host && user && password && database) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}/${database}?sslmode=require`;
  }

  return null;
}

export function getDb() {
  const url = resolveDatabaseUrl();
  if (!url) {
    throw new Error(
      "No Neon database URL found. Expected DATABASE_URL from the Vercel Neon integration.",
    );
  }
  if (!sql) {
    sql = neon(url);
  }
  return sql;
}

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = getDb();
      const schemaPath = join(process.cwd(), "db", "schema.sql");
      const schema = readFileSync(schemaPath, "utf8");
      const statements = schema
        .split(";")
        .map((s) =>
          s
            .split("\n")
            .filter((line) => !line.trim().startsWith("--"))
            .join("\n")
            .trim(),
        )
        .filter((s) => s.length > 0);
      for (const statement of statements) {
        await db.query(statement);
      }
    })();
  }
  await schemaReady;
}

export type DbUser = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  holding: "fan" | "estate";
  decree: string;
  created_at: string;
};

export type DbPetition = {
  id: string;
  user_id: string;
  from_name: string;
  rank: string;
  ask: string;
  status: "open" | "granted" | "denied" | "deferred";
  created_at: string;
};

export type DbTenant = {
  id: string;
  user_id: string;
  name: string;
  rank: string;
  standing: number;
  status: string;
  created_at: string;
};
