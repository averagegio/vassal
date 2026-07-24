import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join } from "path";

let sql: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
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
