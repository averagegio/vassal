/** Investor video demo cast — fictional personas for recording & seeding. */

export type DemoPath = "fan" | "estate" | "shared";

export type DemoCastMember = {
  id: string;
  name: string;
  handle: string;
  title: string;
  path: DemoPath;
  /** Rank / role shown on the casting sheet */
  roleLabel: string;
  portrait: string;
  blurb: string;
  /** One-line beat for the investor video */
  videoBeat: string;
  /** Sample in-product copy when seeded */
  sample?: {
    decree?: string;
    petition?: string;
    hallLine?: string;
    tenantStatus?: string;
    standing?: number;
    courtRank?: "serf" | "baron" | "count" | "viscount" | "duke";
  };
};

export type DemoScene = {
  n: string;
  title: string;
  path: DemoPath;
  castIds: string[];
  body: string;
};

export const DEMO_PASSWORD = "vassal-demo";

export const DEMO_COURT = {
  slug: "rowan-court",
  name: "Rowan Court",
  theme: "crimson" as const,
  widget: "playlist" as const,
  tagline: "Loyalty with a soundtrack.",
};

export const DEMO_ESTATE = {
  name: "Astra Freehold",
  tagline: "Four doors. One Steward. Renewals on purpose.",
};

export const DEMO_CAST: DemoCastMember[] = [
  {
    id: "rowan",
    name: "Lord Rowan",
    handle: "rowan",
    title: "Fan Court Lord",
    path: "fan",
    roleLabel: "Lord · Creator",
    portrait: "/demo/cast/cast_lord_rowan.webp",
    blurb:
      "Indie music creator who runs Rowan Court. Seals decrees the Steward drafts between streams.",
    videoBeat: "Opens the hall, seals Mira’s petition, shows tenure > access.",
    sample: {
      decree:
        "Season of Service is live. Speak in the hall, cheer your peers, climb the board — Steward drafts the weekly wrap; I seal it.",
    },
  },
  {
    id: "mira",
    name: "Ser Mira",
    handle: "mira",
    title: "Rising vassal",
    path: "fan",
    roleLabel: "Count · Superfan",
    portrait: "/demo/cast/cast_ser_mira.webp",
    blurb:
      "Paid member climbing the ladder. Hall activity and petitions make leaving feel like desertion.",
    videoBeat: "Files a shoutout petition; standing compounds on the season board.",
    sample: {
      courtRank: "count",
      standing: 820,
      petition: "Seal a collab shoutout on Friday’s stream — I’ve queued the drop.",
      hallLine: "Board is heating up. Who’s taking Words tonight?",
    },
  },
  {
    id: "cass",
    name: "Baron Cass",
    handle: "cass",
    title: "Hall regular",
    path: "fan",
    roleLabel: "Baron · Jukebox",
    portrait: "/demo/cast/cast_baron_cass.webp",
    blurb:
      "Mid-court energy. Queues tracks in the music booth and keeps the hall loud between drops.",
    videoBeat: "Queues a track; cheers Mira — social proof without a feed doomscroll.",
    sample: {
      courtRank: "baron",
      standing: 410,
      hallLine: "Queued ‘Ember Gate’ for the booth. Cheer if you’re in the keep.",
    },
  },
  {
    id: "wren",
    name: "Serf Wren",
    handle: "wren",
    title: "New join via scroll",
    path: "fan",
    roleLabel: "Serf · Invite",
    portrait: "/demo/cast/cast_serf_wren.webp",
    blurb:
      "Arrives on a vassal summons scroll. Waitlist → Lord seal → first words in the hall.",
    videoBeat: "Invite gravity: scroll → swear fealty → sealed into the retinue.",
    sample: {
      courtRank: "serf",
      standing: 40,
      hallLine: "Just sealed in. Glad to be under the banner.",
    },
  },
  {
    id: "astra",
    name: "Lady Astra",
    handle: "astra",
    title: "Estate host",
    path: "estate",
    roleLabel: "Freehold · Host",
    portrait: "/demo/cast/cast_lady_astra.webp",
    blurb:
      "Small landlord with four doors. House rules on join; Steward triages repairs she seals.",
    videoBeat: "Estate path: petition repair → chill-risk list → renewal defense.",
    sample: {
      decree:
        "Quiet hours 10pm. Photo any repair before you text me — Steward files it as a petition I seal.",
    },
  },
  {
    id: "jules",
    name: "Jules Okonkwo",
    handle: "jules",
    title: "High-standing tenant",
    path: "estate",
    roleLabel: "Tenant · Returner",
    portrait: "/demo/cast/cast_tenant_jules.webp",
    blurb:
      "On-time, careful, high standing. Unlocks returner perks — proof loyalty works both ways.",
    videoBeat: "Standing as retention: perks for care, not just payments.",
    sample: {
      standing: 92,
      tenantStatus: "returner",
      petition: "Bathroom fan rattling — photo attached. Flexible after 5pm.",
    },
  },
  {
    id: "theo",
    name: "Theo Marsh",
    handle: "theo",
    title: "Chill-risk tenant",
    path: "estate",
    roleLabel: "Tenant · Lease end",
    portrait: "/demo/cast/cast_tenant_theo.webp",
    blurb:
      "Lease ending in 28 days. Steward flags chill risk early so Astra can renew before scramble.",
    videoBeat: "Renewal defense: surface churn 30 days early.",
    sample: {
      standing: 54,
      tenantStatus: "chill risk · 28d",
    },
  },
  {
    id: "steward",
    name: "The Steward",
    handle: "steward",
    title: "AI assistant",
    path: "shared",
    roleLabel: "Steward · Seal-gated",
    portrait: "/demo/cast/cast_steward.webp",
    blurb:
      "Drafts in the Lord’s voice, answers routine asks, never pretends to be the human. You seal what goes out.",
    videoBeat: "The catch: a landlord you live under — AI that keeps loyalty warm.",
  },
];

export const DEMO_SCENES: DemoScene[] = [
  {
    n: "01",
    title: "Gate & catch",
    path: "shared",
    castIds: ["steward"],
    body: "Brand first. Tenure beats access. Introduce the Steward as seal-gated AI — not a fake landlord.",
  },
  {
    n: "02",
    title: "Open a Fan Court",
    path: "fan",
    castIds: ["rowan"],
    body: "Lord Rowan opens Rowan Court, sets crimson theme + playlist booth, publishes a Steward-drafted decree he seals.",
  },
  {
    n: "03",
    title: "Invite gravity",
    path: "fan",
    castIds: ["rowan", "wren"],
    body: "Vassal summons scroll → Wren swears fealty → waitlist → Rowan seals grant. Growth without discount spam.",
  },
  {
    n: "04",
    title: "Loyalty loop",
    path: "fan",
    castIds: ["mira", "cass", "rowan"],
    body: "Hall words, cheers, jukebox. Mira’s petition for a shoutout. Season board rises. Cancelling resets standing.",
  },
  {
    n: "05",
    title: "Estate freehold",
    path: "estate",
    castIds: ["astra", "jules", "theo"],
    body: "Astra’s four doors. Jules files a repair petition. Steward flags Theo’s chill risk before lease end.",
  },
  {
    n: "06",
    title: "Ask",
    path: "shared",
    castIds: ["steward", "rowan", "astra"],
    body: "Dual path, one Steward seat. Close on pre-seed: design partners + retention proof.",
  },
];

export function getCastMember(id: string): DemoCastMember | undefined {
  return DEMO_CAST.find((m) => m.id === id);
}

export function castByPath(path: DemoPath): DemoCastMember[] {
  return DEMO_CAST.filter((m) => m.path === path);
}
