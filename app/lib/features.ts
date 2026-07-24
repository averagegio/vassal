/** Shared product copy for Fan Court membership + Real Estate Steward. */

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

export type PetitionDemo = {
  id: string;
  from: string;
  rank: string;
  ask: string;
  status: "open" | "granted" | "denied" | "deferred";
};

export const FAN_FEATURES: FeatureItem[] = [
  {
    id: "tenure",
    title: "Tenure, not a feed",
    body: "Fans swear fealty and take a plot in your holding. Tribute unlocks standing, duties, and audience with the landlord—not just a dump of posts.",
  },
  {
    id: "petitions",
    title: "Petition board",
    body: "Tenants post asks. You seal them Granted, Denied, or Deferred. Every paid fan gets a landlord-touched moment—recognition that keeps tribute flowing.",
  },
  {
    id: "audiences",
    title: "Audience hours",
    body: "Timed court slots where retainers petition live or async. The Steward queues by loyalty so your presence hits the faithful first.",
  },
  {
    id: "decrees",
    title: "Weekly decrees",
    body: "Address the realm by name and rank. The Steward drafts; you crown the words. Public ritual beats endless private DMs.",
  },
  {
    id: "ranks",
    title: "Serf to Lord",
    body: "Loyalty score from watch time, duties, streaks, and tribute. Coronations are theater—promote in public, retain for seasons.",
  },
  {
    id: "campaigns",
    title: "Season campaigns",
    body: "Drop Siege, Harvest, or Coronation kits. Quests, streaks, and titles give churn a story: leaving feels like desertion.",
  },
];

export const REAL_ESTATE_FEATURES: FeatureItem[] = [
  {
    id: "steward-sms",
    title: "Steward on the door",
    body: "AI front desk for small landlords and short-stay hosts. Rent reminders, house-rule answers, and maintenance triage without living in your inbox.",
  },
  {
    id: "house-law",
    title: "House law",
    body: "Quiet hours, guest policy, trash day, Wi-Fi—published on join. Tenants see the law; the Steward enforces the FAQ so you only seal exceptions.",
  },
  {
    id: "repair-petitions",
    title: "Repair petitions",
    body: "Photo + urgency inbox. Steward sorts leaks from lightbulbs; you Grant / Defer with a short seal. Tenants feel governed, not ticketed.",
  },
  {
    id: "standing",
    title: "Tenant standing",
    body: "On-time rent, care of unit, and referrals raise standing. Unlock priority maintenance, late-fee grace, or renewer rank—loyalty that pays for itself.",
  },
  {
    id: "short-stay",
    title: "Short-stay holdings",
    body: "Airbnb and VRBO hosts run a temporary court: rules quiz before check-in, Steward FAQ, welcome decree, and returner ranks for good guests.",
  },
  {
    id: "renewals",
    title: "Renewal seasons",
    body: "Monthly standing narrative and chill-risk list. Vacancy costs more than a Steward—keep tenure warm before the lease ends.",
  },
];

export const SHARED_STEWARD: FeatureItem[] = [
  {
    id: "decree-draft",
    title: "Drafts the decree",
    body: "Weekly court address from your voice and house law. You approve; the realm hears the landlord.",
  },
  {
    id: "favor-list",
    title: "Names who earned favor",
    body: "Ranks petitions and shoutouts by loyalty receipts—so interaction stays fair and theatrical.",
  },
  {
    id: "bounded-voice",
    title: "Speaks as Steward",
    body: "Never impersonates you by default. House taboos, tone, and veto keep trust human.",
  },
];

export const FAN_TIERS: TenureTier[] = [
  {
    id: "serf",
    name: "Serf's Plot",
    rent: "Tribute entry",
    blurb: "Basic tenure in the common hall.",
    perks: ["Public decrees", "Duty board", "Loyalty ledger", "Season quests"],
  },
  {
    id: "freeholder",
    name: "Freeholder",
    rent: "Mid tribute",
    blurb: "Private hall and a monthly petition slot.",
    perks: ["Private drops", "Petition priority", "Early access", "Rank boost"],
  },
  {
    id: "retainer",
    name: "Retainer",
    rent: "High tribute",
    blurb: "Recurring audience and counsel with the landlord.",
    perks: ["Audience hours", "Custom duties", "Coronation track", "House counsel"],
  },
];

export const REAL_ESTATE_TIERS: TenureTier[] = [
  {
    id: "host",
    name: "Host Holding",
    rent: "$29/mo",
    blurb: "One short-stay listing. Steward FAQ + rules oath.",
    perks: ["Check-in Steward", "House law quiz", "Guest petitions", "Returner ranks"],
  },
  {
    id: "freehold",
    name: "Small Freehold",
    rent: "$49/mo",
    blurb: "1–10 doors. SMS Steward + repair board.",
    perks: ["Rent nudges", "Repair inbox", "Standing scores", "Weekly decree draft"],
  },
  {
    id: "manor",
    name: "Manor Seat",
    rent: "$79/mo",
    blurb: "Up to 20 units or multi-listing hosts.",
    perks: ["Renewal seasons", "Chill-risk list", "Referral bounties", "Priority support"],
  },
];

export const FAN_PETITIONS: PetitionDemo[] = [
  {
    id: "p1",
    from: "Mira of the North",
    rank: "Freeholder",
    ask: "Request a sealed voice note for the siege finale.",
    status: "open",
  },
  {
    id: "p2",
    from: "Cole the Steady",
    rank: "Serf",
    ask: "Claim early access to tomorrow's drop for a 14-day streak.",
    status: "granted",
  },
  {
    id: "p3",
    from: "Lord Ash",
    rank: "Retainer",
    ask: "Petition for a private counsel seat this moon.",
    status: "deferred",
  },
];

export const RE_PETITIONS: PetitionDemo[] = [
  {
    id: "r1",
    from: "Unit 2B — Elena",
    rank: "On-time · High standing",
    ask: "Kitchen faucet drip since Tuesday. Photo attached.",
    status: "open",
  },
  {
    id: "r2",
    from: "Unit 4A — Jordan",
    rank: "Renewal track",
    ask: "Approve a weekend guest under house law §3.",
    status: "granted",
  },
  {
    id: "r3",
    from: "Cabin Pine — Guest Maya",
    rank: "First stay",
    ask: "Where is the spare Wi-Fi card? Checkout is Sunday.",
    status: "denied",
  },
];

export const REALM_OVERVIEW_CARDS = [
  {
    id: "oath",
    title: "Take the Oath",
    body: "Fans and tenants swear fealty to a holding. Tribute and duties begin tenure—whether a creator court or a rented plot.",
  },
  {
    id: "landlord",
    title: "Meet the Landlord",
    body: "Creators and property hosts stay interactive through decrees, audiences, and sealed petitions—not endless DMs.",
  },
  {
    id: "steward",
    title: "AI Steward",
    body: "The Steward runs the court between appearances: reminders, FAQ, drafts, and favor lists under your house law.",
  },
  {
    id: "ranks",
    title: "Rise Through Ranks",
    body: "Climb from Serf to Knight to Lord—or from new tenant to renewer—as loyalty and care of the holding grow.",
  },
  {
    id: "rewards",
    title: "Claim Rewards",
    body: "Unlock drops, audiences, priority repairs, and seasonal titles reserved for true vassals of the realm.",
  },
];
