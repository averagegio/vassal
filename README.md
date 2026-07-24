# vassal

AI landlords for fans and freeholds.

## database (Vercel Neon)

This app expects the **Vercel Neon Postgres integration**. That injects:

- `DATABASE_URL` (pooled)
- `DATABASE_URL_UNPOOLED`
- legacy `POSTGRES_*` / `PG*` aliases

No manual Neon connection string is required on Vercel. Schema in `db/schema.sql` is applied on first auth request (including preview branches).

### local

```bash
npx vercel link
npx vercel env pull .env.local
npm run dev
```

Optional: set `SESSION_SECRET` in Vercel. If unset, sessions use a secret derived from `DATABASE_URL`.

## run

```bash
npm run dev
```

## routes

- `/` landing
- `/signup` join
- `/login` enter
- `/dashboard` holding
