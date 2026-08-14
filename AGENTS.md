<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

`vassal` is a Next.js app (Next `16.x`, React `19`, Tailwind CSS `v4`, TypeScript,
ESLint) using the App Router (`app/`). Standard scripts are in `package.json`:

- Dev server: `npm run dev` (Next dev server, defaults to port `3000`).
- Lint: `npm run lint` (`eslint`).
- Production build: `npm run build`; serve a built app with `npm start`.

Notes:

- Dependencies install with `npm ci` (a `package-lock.json` is committed); the
  environment update script handles this on startup.
- This is a newer Next.js than most training data — consult
  `node_modules/next/dist/docs/` before changing framework code (see the rule
  block above).
