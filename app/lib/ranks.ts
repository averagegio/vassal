export const COURT_RANKS = [
  "serf",
  "baron",
  "count",
  "viscount",
  "duke",
] as const;

export type CourtRank = (typeof COURT_RANKS)[number];

export const RANK_LABEL: Record<CourtRank, string> = {
  serf: "Serf",
  baron: "Baron",
  count: "Count",
  viscount: "Viscount",
  duke: "Duke",
};

export const HALL_THEMES = [
  "crimson",
  "midnight",
  "goldleaf",
  "neon",
  "atelier",
  "frost",
  "verdant",
  "slate",
] as const;

export type HallTheme = (typeof HALL_THEMES)[number];

export const THEME_LABEL: Record<HallTheme, string> = {
  crimson: "Crimson Court",
  midnight: "Midnight Keep",
  goldleaf: "Goldleaf Hall",
  neon: "Ember Glow",
  atelier: "Parchment Chamber",
  frost: "Frost Keep",
  verdant: "Verdant Grove",
  slate: "Slate Bastion",
};

/** Short blurb for theme pickers. */
export const THEME_BLURB: Record<HallTheme, string> = {
  crimson: "Warm blood-red canopy",
  midnight: "Cool blue night hall",
  goldleaf: "Gilded candlelight",
  neon: "Hot ember accents",
  atelier: "Soft parchment wash",
  frost: "Icy blue stone",
  verdant: "Deep forest green",
  slate: "Cool grey bastion",
};

export const HALL_WIDGETS = ["none", "playlist", "moodboard", "api"] as const;
export type HallWidget = (typeof HALL_WIDGETS)[number];

export const WIDGET_LABEL: Record<HallWidget, string> = {
  none: "No widget",
  playlist: "Playlist",
  moodboard: "Mood board",
  api: "API import",
};

export const WIDGET_BLURB: Record<HallWidget, string> = {
  none: "Scoreboard and petitions only",
  playlist: "Shared track queue for the court",
  moodboard: "Shared image pins for the court",
  api: "Import a public JSON API feed",
};

export function slugifyCourt(input: string) {
  return input
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

/** Only allow http(s) navigations for user-supplied links. */
export function safeHttpUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
