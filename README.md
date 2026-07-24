# vassal

AI landlords for fans and freeholds.

## setup

Neon Postgres powers membership auth and the holding dashboard.

```bash
cp .env.example .env.local
```

Set in `.env.local`:

```env
DATABASE_URL=postgresql://...@...neon.tech/neondb?sslmode=require
SESSION_SECRET=long-random-string
```

Get a Neon URL from [console.neon.tech](https://console.neon.tech) or claim a Launchpad DB at [neon.new](https://neon.new). Schema in `db/schema.sql` applies on first auth.

Also set `DATABASE_URL` and `SESSION_SECRET` in Vercel project env for deploys.

## run

```bash
npm run dev
```

## routes

- `/` landing
- `/signup` join
- `/login` enter
- `/dashboard` holding
