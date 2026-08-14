# Investor demo cast

Casting sheet in product: [`/demo/cast`](../../app/demo/cast/page.tsx)  
Portraits: [`/public/demo/cast/`](../../public/demo/cast/)

## Characters

| Character | Path | Role | Login |
|-----------|------|------|-------|
| Lord Rowan | Fan Court | Creator / Lord of Rowan Court | `rowan@demo.vassal` |
| Ser Mira | Fan Court | Count · shoutout petition | `mira@demo.vassal` |
| Baron Cass | Fan Court | Baron · jukebox | `cass@demo.vassal` |
| Serf Wren | Fan Court | New join via scroll | `wren@demo.vassal` |
| Lady Astra | Estate | Freehold host (4 doors) | `astra@demo.vassal` |
| Jules Okonkwo | Estate | High-standing tenant | `jules@demo.vassal` |
| Theo Marsh | Estate | Chill-risk · lease end | `theo@demo.vassal` |
| The Steward | Shared | Seal-gated AI (portrait only) | — |

Shared password after seed: `vassal-demo`

## Seed

```bash
npx vercel env pull .env.local
npm run demo:seed
```

Re-runnable. Upserts `*@demo.vassal` users, Rowan Court hall activity, Astra tenants/petitions, and a fresh vassal summons scroll token (printed to stdout).

## Storyboard (six scenes)

1. **Gate & catch** — Steward; tenure beats access  
2. **Open a Fan Court** — Rowan seals a Steward-drafted decree  
3. **Invite gravity** — scroll → Wren swears fealty → Lord seal  
4. **Loyalty loop** — Mira petition, Cass cheers/jukebox, season board  
5. **Estate freehold** — Astra, Jules repair petition, Theo chill risk  
6. **Ask** — dual path, one Steward seat, pre-seed close  

## Portraits for video

Use WebP under `/demo/cast/` for lower-thirds and cold opens. Full-res PNG masters from generation are kept in the agent artifacts folder for editing if needed.
