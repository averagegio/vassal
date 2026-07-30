import { redirect } from "next/navigation";
import { LordsHall, type HallData } from "../../components/LordsHall";

/** Dev-only fixture for Lord's Hall UX + edge-case loops. */
const MOCK: HallData = {
  court: {
    id: "c1",
    slug: "meridian",
    name: "House Meridian",
    theme: "neon",
    widget: "playlist",
    tagline: "Bass for the loyal.",
  },
  lord: {
    id: "lord1",
    name: "Lady Meridian",
    avatarUrl: null,
    xUsername: "meridian",
  },
  leaderboard: [
    {
      userId: "lord1",
      name: "Lady Meridian",
      avatarUrl: null,
      xUsername: "meridian",
      rank: "duke",
      standing: 100,
      role: "lord",
    },
    {
      userId: "v1",
      name: "Ser Kael",
      avatarUrl: null,
      xUsername: "kael",
      rank: "count",
      standing: 72,
      role: "vassal",
    },
    {
      userId: "v2",
      name: "Rowan",
      avatarUrl: null,
      xUsername: null,
      rank: "baron",
      standing: 41,
      role: "vassal",
    },
    {
      userId: "v3",
      name: "New Blood",
      avatarUrl: null,
      xUsername: null,
      rank: "serf",
      standing: 0,
      role: "vassal",
    },
  ],
  playlist: [
    {
      id: "t1",
      title: "Red Banner",
      artist: "Court Tape",
      url: "https://open.spotify.com",
      by: "Ser Kael",
    },
  ],
  moodboard: [],
  viewer: {
    isMember: true,
    isLord: true,
    rank: "duke",
    standing: 100,
    userId: "lord1",
  },
};

export default function HallPreviewPage() {
  if (process.env.NODE_ENV === "production") redirect("/");
  return <LordsHall initial={MOCK} />;
}
