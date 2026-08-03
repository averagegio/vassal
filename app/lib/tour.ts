/** First-time landing tour for visitors without a session. */

export const LANDING_TOUR_STORAGE_KEY = "vassal_landing_tour_done";

export type TourStepId =
  | "welcome"
  | "paths"
  | "fan"
  | "estate"
  | "steward";

export type TourStep = {
  id: TourStepId;
  /** CSS selector for the spotlight target. Null = full-bleed herald panel. */
  target: string | null;
  eyebrow: string;
  title: string;
  body: string;
};

export const LANDING_TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    target: "[data-tour='hero']",
    eyebrow: "Quick tour",
    title: "The gates are open",
    body: "Vassal is AI help for creator communities and rentals. A short walk follows — tap Lexicon anytime for word meanings.",
  },
  {
    id: "paths",
    target: "[data-tour='paths']",
    eyebrow: "Two doors",
    title: "Choose your path",
    body: "Fan Court = paid creator community. Estate = rentals and property. One AI Steward helps both.",
  },
  {
    id: "fan",
    target: "[data-tour='fan']",
    eyebrow: "Fan Court",
    title: "Loyalty that stays home",
    body: "Fans speak in your community hall, send requests, and climb ranks — engagement that grows Fan Court, not X.",
  },
  {
    id: "estate",
    target: "[data-tour='estate']",
    eyebrow: "Estate",
    title: "Rules, repairs, renewals",
    body: "Tenants see house rules on join. The Steward handles routine questions so your inbox stays quiet.",
  },
  {
    id: "steward",
    target: "[data-tour='steward']",
    eyebrow: "Shared",
    title: "Meet the Steward",
    body: "Your AI assistant drafts updates in your voice and never pretends to be you. Join when you are ready.",
  },
];

export function hasCompletedLandingTour(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(LANDING_TOUR_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markLandingTourComplete(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LANDING_TOUR_STORAGE_KEY, "1");
  } catch {
    // Ignore quota / private-mode failures; tour may reappear.
  }
}
