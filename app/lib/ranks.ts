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
] as const;

export type HallTheme = (typeof HALL_THEMES)[number];

export const THEME_LABEL: Record<HallTheme, string> = {
  crimson: "Crimson Court",
  midnight: "Midnight Keep",
  goldleaf: "Goldleaf Hall",
  neon: "Neon Booth (DJ)",
  atelier: "Atelier (Fashion)",
};

export const HALL_WIDGETS = ["none", "playlist", "moodboard"] as const;
export type HallWidget = (typeof HALL_WIDGETS)[number];

export const WIDGET_LABEL: Record<HallWidget, string> = {
  none: "No widget",
  playlist: "Playlist (DJ)",
  moodboard: "Mood board (Fashion)",
};

export function slugifyCourt(input: string) {
  return input
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}
