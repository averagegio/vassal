export const SCROLL_KINDS = ["vassal", "nominate_lord"] as const;
export type ScrollKind = (typeof SCROLL_KINDS)[number];

export type ScrollPublic = {
  token: string;
  kind: ScrollKind;
  title: string;
  greeting: string;
  body: string;
  signOff: string;
  nomineeName: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
    xUsername: string | null;
  };
  court: {
    id: string;
    slug: string;
    name: string;
    tagline: string;
  } | null;
};
