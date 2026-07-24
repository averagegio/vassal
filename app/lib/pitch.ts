export type PitchStep = {
  n: string;
  title: string;
  body: string;
};

export type EarningsRow = {
  label: string;
  value: string;
  note: string;
};

export const FAN_EARNINGS: EarningsRow[] = [
  {
    label: "Creator seat",
    value: "$49/mo",
    note: "Steward + tenure + petitions",
  },
  {
    label: "Year 1 creators",
    value: "2,400",
    note: "Creator overlay + realm pages",
  },
  {
    label: "Year 1 ARR",
    value: "$1.4M",
    note: "Before take-rate upside",
  },
  {
    label: "Year 3 ARR",
    value: "$12M+",
    note: "Seats + 5–8% tribute take",
  },
];

export const ESTATE_EARNINGS: EarningsRow[] = [
  {
    label: "Host / Freehold / Manor",
    value: "$29–79",
    note: "Per holding seat / month",
  },
  {
    label: "Year 1 holdings",
    value: "3,600",
    note: "Short-stay + small landlords",
  },
  {
    label: "Year 1 ARR",
    value: "$1.9M",
    note: "Blended $44 average seat",
  },
  {
    label: "Year 3 ARR",
    value: "$15M+",
    note: "Doors + multi-listing seats",
  },
];

export const MARKETING_SCALE: PitchStep[] = [
  {
    n: "01",
    title: "Overlay first",
    body: "Ship Steward on Discord / SMS. Creators and hosts keep their rails—Vassal owns ritual.",
  },
  {
    n: "02",
    title: "Season kits",
    body: "Drop Siege / Harvest packs. One campaign = acquisition loop without full migration.",
  },
  {
    n: "03",
    title: "Creator + host loops",
    body: "Fan Court via Twitch/IG mid-tiers. Estate via Airbnb host forums and mom-and-pop PMs.",
  },
  {
    n: "04",
    title: "Realm pages",
    body: "Thin paid gates when landlords ask. Convert overlay loyalty into tenure revenue.",
  },
  {
    n: "05",
    title: "Agency → product",
    body: "Run 20 courts by hand. Codify the Steward playbook. Self-serve the winners.",
  },
  {
    n: "06",
    title: "Network effects",
    body: "Banners and ranks travel. Tenants swear across holdings. Loyalty compounds on Vassal.",
  },
];

export const FAN_STEPS: PitchStep[] = [
  {
    n: "01",
    title: "Open a Fan Court",
    body: "Sign up, pick Fan Court, crown your house law and voice.",
  },
  {
    n: "02",
    title: "Invite tenants",
    body: "Share your realm link. Fans swear fealty and take a tribute plot.",
  },
  {
    n: "03",
    title: "Let the Steward run",
    body: "Decrees draft, duties track, favor lists queue—between your appearances.",
  },
  {
    n: "04",
    title: "Seal petitions",
    body: "Grant, defer, or deny. Every paid fan gets a landlord-touched moment.",
  },
  {
    n: "05",
    title: "Hold audience hours",
    body: "Timed court slots. Loyalty goes first. Retainers rise.",
  },
  {
    n: "06",
    title: "Run seasons",
    body: "Quest kits, streaks, coronations. Churn gets a story—leaving feels like desertion.",
  },
];

export const ESTATE_STEPS: PitchStep[] = [
  {
    n: "01",
    title: "Open a freehold",
    body: "Sign up, pick Estate, set house law for your doors or short-stay.",
  },
  {
    n: "02",
    title: "Connect the door",
    body: "Steward on SMS or listing FAQ. Rent stays on your rails.",
  },
  {
    n: "03",
    title: "Publish house law",
    body: "Quiet hours, guests, trash, Wi-Fi—on join. Steward answers the rest.",
  },
  {
    n: "04",
    title: "Triage repairs",
    body: "Photo petitions in. You seal. Noise stays out of your inbox.",
  },
  {
    n: "05",
    title: "Raise standing",
    body: "On-time and care unlock perks. Renewers earn the high table.",
  },
  {
    n: "06",
    title: "Defend renewals",
    body: "Chill-risk list before lease end. Vacancy costs more than a Steward.",
  },
];
