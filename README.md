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

## X sign-in

Add to Vercel env:

```env
X_CLIENT_ID=...
X_CLIENT_SECRET=...
APP_URL=https://your-domain.com
```

In the X Developer Portal (OAuth 2.0, confidential / Web App):

- Callback URL (exact match): `https://your-domain.com/api/auth/x/callback`
- Also add preview/local callbacks you use (e.g. `http://127.0.0.1:3000/api/auth/x/callback`)
- Scopes: `users.read`, `tweet.read`, `offline.access`

`APP_URL` is optional; the app prefers the live request host so PKCE cookies and the redirect URI stay aligned.

## run

```bash
npm run dev
```

## routes

- `/` landing
- `/signup` join (`?court=slug` swears into a hall after auth)
- `/login` enter
- `/dashboard` holding + Court tab (followers / following counts)
- `/u/[handle]` public profile (follow / unfollow, lists)
- `/hall/[slug]` Lord's Hall (scoreboard, follow Lord, themes, widgets, scrolls)
- `/scroll/[token]` Custom parchment invite (vassal summons or Lord nomination)
