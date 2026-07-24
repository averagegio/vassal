/** Shared product copy — keep punchy. */

export type TenureTier = {
  id: string;
  name: string;
  rent: string;
  blurb: string;
  perks: string[];
};

export type FeatureItem = {
  id: string;
  title: string;
  body: string;
};

export type Petition = {
  id: string;
  from: string;
  rank: string;
  ask: string;
  status: "open" | "granted" | "denied" | "deferred";
};

export const FAN_FEATURES: FeatureItem[] = [
  {
    id: "tenure",
    title: "Tenure",
    body: "Tribute buys a plot—not a feed dump.",
  },
  {
    id: "petitions",
    title: "Petitions",
    body: "Tenants ask. You seal. They feel seen.",
  },
  {
    id: "audiences",
    title: "Audiences",
    body: "Timed court slots. Loyalty goes first.",
  },
  {
    id: "decrees",
    title: "Decrees",
    body: "Steward drafts. You crown the words.",
  },
  {
    id: "ranks",
    title: "Ranks",
    body: "Serf → Knight → Lord. Crown in public.",
  },
  {
    id: "campaigns",
    title: "Seasons",
    body: "Quests and titles. Churn gets a story.",
  },
];

export const REAL_ESTATE_FEATURES: FeatureItem[] = [
  {
    id: "steward-door",
    title: "Steward",
    body: "Rent nudges and FAQ—without the inbox.",
  },
  {
    id: "house-law",
    title: "House law",
    body: "Rules on join. Steward handles the rest.",
  },
  {
    id: "repair-petitions",
    title: "Repairs",
    body: "Photo in. You seal. Noise stays out.",
  },
  {
    id: "standing",
    title: "Standing",
    body: "On-time and care unlock real perks.",
  },
  {
    id: "short-stay",
    title: "Short-stay",
    body: "Rules quiz, FAQ, returner ranks.",
  },
  {
    id: "renewals",
    title: "Renewals",
    body: "Spot chill risk before the lease ends.",
  },
];

export const SHARED_STEWARD: FeatureItem[] = [
  {
    id: "decree-draft",
    title: "Drafts decrees",
    body: "Your voice. Your seal.",
  },
  {
    id: "favor-list",
    title: "Names favor",
    body: "Ranks who earned the shoutout.",
  },
  {
    id: "bounded-voice",
    title: "Stays Steward",
    body: "Never fakes being you.",
  },
];

export const FAN_TIERS: TenureTier[] = [
  {
    id: "serf",
    name: "Serf's Plot",
    rent: "Entry",
    blurb: "Common hall access.",
    perks: ["Decrees", "Duties", "Ledger", "Quests"],
  },
  {
    id: "freeholder",
    name: "Freeholder",
    rent: "Mid",
    blurb: "Private hall + petition slot.",
    perks: ["Drops", "Priority", "Early access", "Boost"],
  },
  {
    id: "retainer",
    name: "Retainer",
    rent: "High",
    blurb: "Recurring audience with you.",
    perks: ["Audiences", "Duties", "Coronation", "Counsel"],
  },
];

export const REAL_ESTATE_TIERS: TenureTier[] = [
  {
    id: "host",
    name: "Host Holding",
    rent: "$29/mo",
    blurb: "One short-stay listing.",
    perks: ["Check-in", "Law quiz", "Petitions", "Returners"],
  },
  {
    id: "freehold",
    name: "Small Freehold",
    rent: "$49/mo",
    blurb: "1–10 doors.",
    perks: ["Front desk", "Repairs", "Standing", "Decrees"],
  },
  {
    id: "manor",
    name: "Manor Seat",
    rent: "$79/mo",
    blurb: "Up to 20 units.",
    perks: ["Renewals", "Chill risk", "Referrals", "Support"],
  },
];
