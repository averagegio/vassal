/** Public profile handle: @x username, or raw user id. */
export function profileHandle(user: {
  id: string;
  x_username?: string | null;
  xUsername?: string | null;
}): string {
  const x = (user.x_username ?? user.xUsername)?.trim();
  if (x) return x.replace(/^@/, "");
  return user.id;
}
