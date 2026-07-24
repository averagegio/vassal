-- Vassal schema for Neon Postgres

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  holding TEXT NOT NULL CHECK (holding IN ('fan', 'estate')),
  decree TEXT NOT NULL DEFAULT '',
  x_id TEXT UNIQUE,
  x_username TEXT,
  avatar_url TEXT,
  header_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migrations for existing installs
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS x_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS x_username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS header_url TEXT;

CREATE TABLE IF NOT EXISTS petitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_name TEXT NOT NULL,
  rank TEXT NOT NULL,
  ask TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'granted', 'denied', 'deferred')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rank TEXT NOT NULL,
  standing INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS petitions_user_id_idx ON petitions(user_id);
CREATE INDEX IF NOT EXISTS tenants_user_id_idx ON tenants(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS users_x_id_idx ON users(x_id) WHERE x_id IS NOT NULL;
