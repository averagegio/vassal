import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

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

async function main() {
  const url = resolveDatabaseUrl();
  if (!url) {
    console.log("No DATABASE_URL (Vercel Neon) — skip migrate.");
    return;
  }

  const sql = neon(url);
  const schema = readFileSync(join(__dirname, "..", "db", "schema.sql"), "utf8");
  const statements = schema
    .split(";")
    .map((s) =>
      s
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter(Boolean);

  for (const statement of statements) {
    await sql.query(statement);
  }
  console.log("Schema ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
