/** Deep-link that skips the bleed-flag intro and opens on the landing gate. */
export const LANDING_HREF = "/?enter=1";

export type HoldingCourtRef = {
  slug: string;
  role: "lord" | "vassal";
};

/** Signed-in member shown on the marketing landing. */
export type LandingViewer = {
  name: string;
  avatarUrl: string | null;
  homeHref: string;
};

/**
 * Where a signed-in member should land.
 * Lords go straight to Lord setup in their hall.
 */
export function holdingHomeHref(court: HoldingCourtRef | null | undefined): string {
  if (court?.role === "lord" && court.slug) {
    return `/hall/${encodeURIComponent(court.slug)}?tab=setup`;
  }
  if (court?.slug) {
    return `/hall/${encodeURIComponent(court.slug)}`;
  }
  return "/dashboard";
}

export function shouldSkipIntro(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): boolean {
  const value = searchParams?.enter;
  const enter = Array.isArray(value) ? value[0] : value;
  return enter === "1";
}
