/** Plain-English appendix for Vassal's medieval product terms. */

export type LexiconTermId =
  | "holding"
  | "fan-court"
  | "estate"
  | "steward"
  | "court"
  | "lord"
  | "vassal"
  | "hall"
  | "fealty"
  | "decree"
  | "petition"
  | "tribute"
  | "standing"
  | "freehold"
  | "serf"
  | "retinue"
  | "seal"
  | "scroll"
  | "community-hall";

export type LexiconEntry = {
  id: LexiconTermId;
  term: string;
  plain: string;
  detail: string;
};

export const LEXICON: LexiconEntry[] = [
  {
    id: "holding",
    term: "Holding",
    plain: "Your workspace on Vassal",
    detail:
      "A holding is the account path you pick: Fan Court for creator communities, or Estate for rentals and property.",
  },
  {
    id: "fan-court",
    term: "Fan Court",
    plain: "A paid creator community",
    detail:
      "Fans join your court, speak in the community hall, climb ranks, send requests, and earn recognition — engagement that stays on Vassal.",
  },
  {
    id: "estate",
    term: "Estate",
    plain: "A rental / property workspace",
    detail:
      "For hosts and landlords: house rules, repair requests, renewals, and an AI front desk for tenants.",
  },
  {
    id: "steward",
    term: "Steward",
    plain: "Your AI assistant",
    detail:
      "The Steward drafts updates in your voice, answers routine questions, and never pretends to be you.",
  },
  {
    id: "court",
    term: "Court",
    plain: "Your creator community space",
    detail:
      "The group fans join under a Lord. Each court has a Hall page with a public community feed, ranks, and a season scoreboard earned in-hall.",
  },
  {
    id: "lord",
    term: "Lord",
    plain: "The owner of a court",
    detail:
      "The person who opens the court, hosts the community hall, picks a hall theme, sets the built-in hall music booth, enables optional widgets, and runs Lord setup.",
  },
  {
    id: "vassal",
    term: "Vassal",
    plain: "A member — and the product name",
    detail:
      "As a role: someone sworn into a court. As a brand: Vassal is the whole app for fans and rentals.",
  },
  {
    id: "hall",
    term: "Lord's Hall",
    plain: "The court's public home page",
    detail:
      "Where visitors read the community hall, members speak and cheer, and Lords run setup. Season points come from hall activity — not from X.",
  },
  {
    id: "community-hall",
    term: "Community hall",
    plain: "The court's public comment feed",
    detail:
      "Front-facing words, replies, and cheers inside Fan Court. This is where loyalty shows — so fans stay here instead of performing only on X.",
  },
  {
    id: "fealty",
    term: "Swear fealty",
    plain: "Join a court",
    detail:
      "The join action. You become a member of that Lord's court and show up on its roster.",
  },
  {
    id: "decree",
    term: "Decree",
    plain: "A public update or post",
    detail:
      "Announcements to your court or tenants. The Steward can draft; you approve before it goes out.",
  },
  {
    id: "petition",
    term: "Petition",
    plain: "A member or tenant request",
    detail:
      "Asks for access, help, or a repair. You approve, deny, or defer — that is “sealing” the ask.",
  },
  {
    id: "tribute",
    term: "Tribute",
    plain: "Paid membership",
    detail:
      "What fans pay for a plot/tier in your court. Higher tribute unlocks better access and perks.",
  },
  {
    id: "standing",
    term: "Standing",
    plain: "Reputation score",
    detail:
      "How trusted a member or tenant is. In Fan Court, speaking, replying, and cheering in the hall raise standing for the season.",
  },
  {
    id: "freehold",
    term: "Freehold",
    plain: "A small property portfolio",
    detail:
      "Estate pricing tier for a handful of doors. Also used loosely for “your rental holding.”",
  },
  {
    id: "serf",
    term: "Serf",
    plain: "Entry-level fan rank",
    detail:
      "The starting rung on the court ladder. Higher ranks (and titles) come with loyalty and tribute.",
  },
  {
    id: "retinue",
    term: "Retinue",
    plain: "Your member roster / leaderboard",
    detail:
      "Everyone sworn to the court, ranked by standing and season points.",
  },
  {
    id: "seal",
    term: "Seal",
    plain: "Approve or publish",
    detail:
      "Your final say: seal a petition, seal a decree. Nothing goes live as “you” without it.",
  },
  {
    id: "scroll",
    term: "Scroll",
    plain: "A shareable invite parchment",
    detail:
      "Lords seal vassal summons to recruit members. Vassals seal nomination scrolls asking a creator to open a hall as Lord.",
  },
];

export function getLexiconEntry(id: string | null | undefined): LexiconEntry | null {
  if (!id) return null;
  return LEXICON.find((entry) => entry.id === id) ?? null;
}
