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

CREATE TABLE IF NOT EXISTS decrees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lord_user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'crimson'
    CHECK (theme IN ('crimson', 'midnight', 'goldleaf', 'neon', 'atelier')),
  widget TEXT NOT NULL DEFAULT 'none'
    CHECK (widget IN ('none', 'playlist', 'moodboard')),
  tagline TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS court_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  rank TEXT NOT NULL DEFAULT 'serf'
    CHECK (rank IN ('serf', 'baron', 'count', 'viscount', 'duke')),
  standing INTEGER NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'vassal'
    CHECK (role IN ('lord', 'vassal')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hall_playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hall_mood_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  source_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS court_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Season of Service',
  target_replies INTEGER NOT NULL DEFAULT 60,
  target_reposts INTEGER NOT NULL DEFAULT 20,
  target_mentions INTEGER NOT NULL DEFAULT 15,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS season_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES court_seasons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  replies INTEGER NOT NULL DEFAULT 0,
  reposts INTEGER NOT NULL DEFAULT 0,
  mentions INTEGER NOT NULL DEFAULT 0,
  UNIQUE (season_id, user_id)
);

CREATE INDEX IF NOT EXISTS petitions_user_id_idx ON petitions(user_id);
CREATE INDEX IF NOT EXISTS tenants_user_id_idx ON tenants(user_id);
CREATE INDEX IF NOT EXISTS decrees_user_id_idx ON decrees(user_id);
CREATE INDEX IF NOT EXISTS decrees_created_at_idx ON decrees(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS courts_slug_idx ON courts(slug);
CREATE INDEX IF NOT EXISTS court_members_court_id_idx ON court_members(court_id);
CREATE INDEX IF NOT EXISTS hall_playlist_court_id_idx ON hall_playlist_tracks(court_id);
CREATE INDEX IF NOT EXISTS hall_mood_court_id_idx ON hall_mood_pins(court_id);
CREATE INDEX IF NOT EXISTS court_seasons_court_id_idx ON court_seasons(court_id);
CREATE INDEX IF NOT EXISTS season_scores_season_id_idx ON season_scores(season_id);
CREATE UNIQUE INDEX IF NOT EXISTS users_x_id_idx ON users(x_id) WHERE x_id IS NOT NULL;
