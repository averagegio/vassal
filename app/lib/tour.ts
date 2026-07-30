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
    eyebrow: "First audience",
    title: "The gates are open",
    body: "Vassal is AI landlords for fans and freeholds. A short walk of the realm follows.",
  },
  {
    id: "paths",
    target: "[data-tour='paths']",
    eyebrow: "Two doors",
    title: "Pick a holding",
    body: "Fan Court for creators. Estate for property. One Steward serves both.",
  },
  {
    id: "fan",
    target: "[data-tour='fan']",
    eyebrow: "Fan Court",
    title: "Membership that ranks",
    body: "Tribute, petitions, and crowns—tenants climb standing in your court.",
  },
  {
    id: "estate",
    target: "[data-tour='estate']",
    eyebrow: "Estate",
    title: "Law, repairs, renewals",
    body: "House rules on join. The Steward keeps the inbox quiet.",
  },
  {
    id: "steward",
    target: "[data-tour='steward']",
    eyebrow: "Shared",
    title: "Meet the Steward",
    body: "Drafts decrees in your voice, never fakes being you. Join when you are ready.",
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
