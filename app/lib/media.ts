import { safeHttpUrl } from "./ranks";

export type TrackPlayback =
  | { kind: "audio"; src: string }
  | { kind: "youtube"; embedSrc: string; watchUrl: string }
  | { kind: "soundcloud"; embedSrc: string; watchUrl: string }
  | { kind: "spotify"; embedSrc: string; watchUrl: string }
  | { kind: "link"; href: string }
  | { kind: "none" };

const AUDIO_EXT = /\.(mp3|ogg|oga|wav|m4a|aac|flac|opus)(\?|#|$)/i;

/** Classify a track URL for in-hall playback (Myspace-style booth). */
export function resolveTrackPlayback(rawUrl: string | null | undefined): TrackPlayback {
  const href = rawUrl ? safeHttpUrl(rawUrl) : null;
  if (!href) return { kind: "none" };

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return { kind: "none" };
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (AUDIO_EXT.test(url.pathname) || AUDIO_EXT.test(href)) {
    return { kind: "audio", src: href };
  }

  if (host === "youtu.be" || host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    const id = youtubeId(url);
    if (id) {
      return {
        kind: "youtube",
        watchUrl: href,
        embedSrc: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`,
      };
    }
  }

  if (host === "open.spotify.com" || host === "play.spotify.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    const type = parts[0];
    const id = parts[1]?.split("?")[0];
    if (type && id && ["track", "album", "playlist", "episode"].includes(type)) {
      return {
        kind: "spotify",
        watchUrl: href,
        embedSrc: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
      };
    }
  }

  if (host === "soundcloud.com" || host === "m.soundcloud.com" || host === "on.soundcloud.com") {
    return {
      kind: "soundcloud",
      watchUrl: href,
      embedSrc: `https://w.soundcloud.com/player/?url=${encodeURIComponent(href)}&color=%23c9a227&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`,
    };
  }

  return { kind: "link", href };
}

export function playbackLabel(playback: TrackPlayback): string {
  switch (playback.kind) {
    case "audio":
      return "Direct audio";
    case "youtube":
      return "YouTube";
    case "soundcloud":
      return "SoundCloud";
    case "spotify":
      return "Spotify";
    case "link":
      return "External link";
    default:
      return "No media";
  }
}

function youtubeId(url: URL): string | null {
  if (url.hostname.replace(/^www\./, "") === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id || null;
  }
  const v = url.searchParams.get("v");
  if (v) return v;
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") {
    return parts[1] || null;
  }
  return null;
}
