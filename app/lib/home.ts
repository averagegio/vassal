/** Deep-link that skips the bleed-flag intro and opens on the landing gate. */
export const LANDING_HREF = "/?enter=1";

export function shouldSkipIntro(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): boolean {
  const value = searchParams?.enter;
  const enter = Array.isArray(value) ? value[0] : value;
  return enter === "1";
}
