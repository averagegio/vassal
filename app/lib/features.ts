/** Shared product copy — keep punchy and plain. */

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
    title: "Paid tiers",
    body: "Fans pay for a membership level — not just a noisy feed.",
  },
  {
    id: "petitions",
    title: "Requests",
    body: "Members ask for access or favors. You approve each one.",
  },
  {
    id: "audiences",
    title: "Live slots",
    body: "Timed sessions with you. Loyal fans go first.",
  },
  {
    id: "decrees",
    title: "Updates",
    body: "The Steward drafts posts. You approve before they go out.",
  },
  {
    id: "ranks",
    title: "Ranks",
    body: "Public status ladder — earn recognition in the open.",
  },
  {
    id: "campaigns",
    title: "Seasons",
    body: "Time-boxed challenges and titles so membership has a story.",
  },
];

export const REAL_ESTATE_FEATURES: FeatureItem[] = [
  {
    id: "steward-door",
    title: "AI front desk",
    body: "Rent reminders and FAQs without living in your inbox.",
  },
  {
    id: "house-law",
    title: "House rules",
    body: "Shown on join. The Steward answers the repeat questions.",
  },
  {
    id: "repair-petitions",
    title: "Repairs",
    body: "Photo in, you approve, the noise stays out of group chats.",
  },
  {
    id: "standing",
    title: "Tenant score",
    body: "On-time and careful tenants unlock real perks.",
  },
  {
    id: "short-stay",
    title: "Short-stay",
    body: "Rules quiz, FAQ, and return-guest recognition.",
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
    title: "Drafts updates",
    body: "Your voice. Your approval.",
  },
  {
    id: "favor-list",
    title: "Names who earned it",
    body: "Surfaces members worth a shoutout.",
  },
  {
    id: "bounded-voice",
    title: "Stays the Steward",
    body: "Never fakes being you.",
  },
];

export const FAN_TIERS: TenureTier[] = [
  {
    id: "serf",
    name: "Starter",
    rent: "Entry",
    blurb: "Basic community access.",
    perks: ["Updates", "Tasks", "Ledger", "Challenges"],
  },
  {
    id: "freeholder",
    name: "Member+",
    rent: "Mid",
    blurb: "Private rooms + a request slot.",
    perks: ["Drops", "Priority", "Early access", "Boost"],
  },
  {
    id: "retainer",
    name: "Inner circle",
    rent: "High",
    blurb: "Recurring time with you.",
    perks: ["Live slots", "Tasks", "Titles", "Counsel"],
  },
];

export const REAL_ESTATE_TIERS: TenureTier[] = [
  {
    id: "host",
    name: "Host plan",
    rent: "$29/mo",
    blurb: "One short-stay listing.",
    perks: ["Check-in", "Rules quiz", "Requests", "Returners"],
  },
  {
    id: "freehold",
    name: "Small portfolio",
    rent: "$49/mo",
    blurb: "1–10 doors.",
    perks: ["Front desk", "Repairs", "Tenant score", "Updates"],
  },
  {
    id: "manor",
    name: "Larger portfolio",
    rent: "$79/mo",
    blurb: "Up to 20 units.",
    perks: ["Renewals", "Chill risk", "Referrals", "Support"],
  },
];
