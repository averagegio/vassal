/** Investor pitch copy — illustrative projections, not audited forecasts. */

export type PitchStep = {
  n: string;
  title: string;
  body: string;
};

export type MetricRow = {
  label: string;
  value: string;
  note: string;
};

export type FundingRound = {
  stage: string;
  raise: string;
  use: string;
  milestone: string;
};

export type RevenueYear = {
  year: string;
  mrr: string;
  arr: string;
  note: string;
};

export const STEWARD_CATCH = {
  eyebrow: "The catch",
  title: "A landlord you live under",
  lead: "Patreon sells access. Listing tools sell calendars. Vassal sells tenure — an AI Steward that keeps loyalty warm between appearances.",
  fan: {
    title: "Fan Court",
    plain: "Paid creator community",
    catch:
      "Fans don’t just subscribe — they swear into a court. Ranks, requests, and seasons make leaving feel like desertion, not a cancel click.",
    steward:
      "The Steward drafts updates in your voice, queues who earned a shoutout, and never pretends to be you. You seal what goes out.",
  },
  freehold: {
    title: "Freehold / Estate",
    plain: "Rentals & small portfolios",
    catch:
      "Hosts don’t need another inbox. House rules live on join; repair requests arrive as petitions you approve. Vacancy costs more than a Steward.",
    steward:
      "Front-desk answers, rent nudges, and chill-risk before lease end — so renewals become a habit, not a scramble.",
  },
};

export const SITE_FLOW: PitchStep[] = [
  {
    n: "01",
    title: "Gate",
    body: "Intro flag → portcullis rises → brand, path choice, and Lexicon for plain meanings.",
  },
  {
    n: "02",
    title: "Path",
    body: "Join as Fan Court (creators) or Estate (rentals). One Steward serves both.",
  },
  {
    n: "03",
    title: "Dashboard",
    body: "Profile, decrees, petitions, tenants/court — the holding’s day-to-day.",
  },
  {
    n: "04",
    title: "Lord’s Hall",
    body: "Public court home: season scoreboard, community widgets, Lord setup.",
  },
  {
    n: "05",
    title: "Loyalty loop",
    body: "Standing rises, ranks show, Steward drafts, you seal — retention compounds.",
  },
];

export const MARKET: MetricRow[] = [
  {
    label: "TAM",
    value: "$180B+",
    note: "Creator membership tooling + short-stay / small-landlord software worldwide",
  },
  {
    label: "SAM",
    value: "$28B",
    note: "English-speaking creators with paid communities + hosts under 20 doors",
  },
  {
    label: "SOM (Y5)",
    value: "$420M",
    note: "~1.5% of SAM via Steward seats + light take-rate on Fan Court tribute",
  },
];

/** Blended SaaS seat assumptions: Fan ~$49, Estate ~$44. */
export const REVENUE_YEARS: RevenueYear[] = [
  {
    year: "Y1",
    mrr: "$275K",
    arr: "$3.3M",
    note: "~6K paying seats · seats first, take-rate optional",
  },
  {
    year: "Y2",
    mrr: "$850K",
    arr: "$10.2M",
    note: "Overlay → paid gates · early tribute take 3–5%",
  },
  {
    year: "Y3",
    mrr: "$2.1M",
    arr: "$25M+",
    note: "Dual loops at scale · ~75%+ gross on Steward seats",
  },
  {
    year: "Y5",
    mrr: "$8M+",
    arr: "$100M+",
    note: "Category seat in loyalty ops for fans + doors",
  },
];

export const FAN_EARNINGS: MetricRow[] = [
  {
    label: "Creator seat",
    value: "$49/mo",
    note: "Steward + tenure + petitions",
  },
  {
    label: "Y1 creators",
    value: "2,400",
    note: "Overlay first, then realm pages",
  },
  {
    label: "Y1 ARR",
    value: "$1.4M",
    note: "Before tribute take-rate",
  },
  {
    label: "Y3 ARR",
    value: "$12M+",
    note: "Seats + 5–8% tribute take",
  },
];

export const ESTATE_EARNINGS: MetricRow[] = [
  {
    label: "Host → Manor",
    value: "$29–79",
    note: "Per holding / month",
  },
  {
    label: "Y1 holdings",
    value: "3,600",
    note: "Short-stay + small landlords",
  },
  {
    label: "Y1 ARR",
    value: "$1.9M",
    note: "Blended ~$44 seat",
  },
  {
    label: "Y3 ARR",
    value: "$15M+",
    note: "Multi-door seats & renewals",
  },
];

export const FUNDING_ROUNDS: FundingRound[] = [
  {
    stage: "Pre-seed",
    raise: "$1.5M",
    use: "Core product, Steward voice, first 50 courts by hand",
    milestone: "Design partners live · proof of retention",
  },
  {
    stage: "Seed",
    raise: "$6M",
    use: "Self-serve signup, season kits, SMS/Discord overlay",
    milestone: "$1M ARR · dual-path PMF",
  },
  {
    stage: "Series A",
    raise: "$20M",
    use: "Growth loops, payment rails, take-rate experiments",
    milestone: "$8–12M ARR · national creator + host brand",
  },
  {
    stage: "Series B",
    raise: "$50M",
    use: "Intl expansion, agency → product, deeper X/listing sync",
    milestone: "$40M+ ARR · category narrative locked",
  },
  {
    stage: "Series C",
    raise: "$120M",
    use: "Platform depth, partnerships, enterprise freeholds",
    milestone: "$100M+ ARR path",
  },
  {
    stage: "Series D–M",
    raise: "Growth rounds",
    use: "Global loyalty rails · optional infra / data layer",
    milestone: "Default Steward for tenure online",
  },
];

export const GROWTH_PLAN: PitchStep[] = [
  {
    n: "01",
    title: "Habit over feed",
    body: "Weekly Steward drafts + petition seals create a landlord cadence users expect — not a doomscroll.",
  },
  {
    n: "02",
    title: "Standing that sticks",
    body: "Public ranks and season points make status portable. Cancelling resets hard-won standing.",
  },
  {
    n: "03",
    title: "Season kits",
    body: "Time-boxed quests (Siege, Harvest, Booth) re-activate quiet members without discount spam.",
  },
  {
    n: "04",
    title: "Renewal defense",
    body: "Estate chill-risk lists and Fan Court tribute ladders surface churn 30 days early.",
  },
  {
    n: "05",
    title: "Invite gravity",
    body: "Hall pages and banners travel. Loyal tenants pull peers into the same Steward ritual.",
  },
  {
    n: "06",
    title: "Upgrade path",
    body: "Starter → Member+ → Inner circle (fans); Host → Freehold → Manor (doors). Revenue grows with loyalty.",
  },
];

export const FAN_STEPS: PitchStep[] = [
  {
    n: "01",
    title: "Open a Fan Court",
    body: "Sign up, pick Fan Court, set house voice and rules.",
  },
  {
    n: "02",
    title: "Invite members",
    body: "Share your hall link. Fans join, pick a paid tier, climb ranks.",
  },
  {
    n: "03",
    title: "Let the Steward run",
    body: "Drafts queue between streams. You approve every public word.",
  },
  {
    n: "04",
    title: "Seal requests",
    body: "Grant, defer, or deny. Every paid fan gets a landlord-touched moment.",
  },
  {
    n: "05",
    title: "Run seasons",
    body: "Challenges and titles. Churn gets a story — leaving feels like desertion.",
  },
];

export const ESTATE_STEPS: PitchStep[] = [
  {
    n: "01",
    title: "Open an Estate",
    body: "Sign up, pick Estate, publish house rules for your doors or short-stay.",
  },
  {
    n: "02",
    title: "Connect the door",
    body: "Steward on SMS or listing FAQ. Rent can stay on your existing rails.",
  },
  {
    n: "03",
    title: "Triage repairs",
    body: "Photo in → you approve. Noise stays out of group chats.",
  },
  {
    n: "04",
    title: "Raise standing",
    body: "On-time and careful tenants unlock perks and returner status.",
  },
  {
    n: "05",
    title: "Defend renewals",
    body: "Spot chill risk before lease end. Keep doors filled.",
  },
];
