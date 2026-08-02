"use client";

import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
} from "react";
import { playbackLabel, resolveTrackPlayback } from "../lib/media";

export type HallTrack = {
  id: string;
  title: string;
  artist: string;
  url: string;
  by?: string;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function HallMusicPlayer({
  tracks,
  activeTrackId,
  onActiveTrackIdChange,
  emptyHint,
}: {
  tracks: HallTrack[];
  activeTrackId: string | null;
  onActiveTrackIdChange: (id: string) => void;
  emptyHint?: string;
}) {
  const reactId = useId().replace(/:/g, "");
  const [unlocked, setUnlocked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioApiRef = useRef<{
    play: () => Promise<void>;
    pause: () => void;
    paused: () => boolean;
  } | null>(null);

  const active =
    tracks.find((t) => t.id === activeTrackId) ?? tracks[0] ?? null;
  const activeIndex = active
    ? Math.max(0, tracks.findIndex((t) => t.id === active.id))
    : -1;
  const playback = resolveTrackPlayback(active?.url);
  const canNativePlay = playback.kind === "audio";
  const canEmbed =
    playback.kind === "youtube" ||
    playback.kind === "soundcloud" ||
    playback.kind === "spotify";

  const selectTrack = (id: string, opts?: { expandEmbed?: boolean }) => {
    onActiveTrackIdChange(id);
    setError(null);
    setPlaying(false);
    if (opts?.expandEmbed) setExpanded(true);
  };

  const playPrev = () => {
    if (tracks.length < 2 || activeIndex < 0) return;
    const next = tracks[(activeIndex - 1 + tracks.length) % tracks.length];
    const nextPlayback = resolveTrackPlayback(next.url);
    selectTrack(next.id, {
      expandEmbed:
        nextPlayback.kind === "youtube" ||
        nextPlayback.kind === "soundcloud" ||
        nextPlayback.kind === "spotify",
    });
    setUnlocked(true);
  };

  const playNext = () => {
    if (tracks.length < 2 || activeIndex < 0) return;
    const next = tracks[(activeIndex + 1) % tracks.length];
    const nextPlayback = resolveTrackPlayback(next.url);
    selectTrack(next.id, {
      expandEmbed:
        nextPlayback.kind === "youtube" ||
        nextPlayback.kind === "soundcloud" ||
        nextPlayback.kind === "spotify",
    });
    setUnlocked(true);
  };

  if (tracks.length === 0) {
    return (
      <aside className="hall-booth hall-booth-empty" aria-label="Hall music">
        <div className="hall-booth-eq" aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.2em] uppercase text-[var(--vassal-gold)]">
            Hall booth
          </p>
          <p className="mt-1 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_60%,transparent)]">
            {emptyHint || "No hall song yet — add a track to strike up the band."}
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`hall-booth ${playing ? "hall-booth-live" : ""}`}
      aria-label="Hall music player"
    >
      {!unlocked ? (
        <button
          type="button"
          className="hall-booth-gate"
          onClick={() => {
            if (active && !activeTrackId) {
              onActiveTrackIdChange(active.id);
            }
            setUnlocked(true);
            setError(null);
            if (canEmbed || playback.kind === "link") {
              setExpanded(true);
              setPlaying(true);
            }
          }}
        >
          <span className="hall-booth-disc" aria-hidden />
          <span className="min-w-0 text-left">
            <span className="block font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.2em] uppercase text-[var(--vassal-gold)]">
              This hall plays music
            </span>
            <span className="mt-1 block truncate font-[family-name:var(--font-display)] text-sm tracking-[0.06em]">
              {active?.title}
              {active?.artist ? ` — ${active.artist}` : ""}
            </span>
            <span className="mt-1 block font-[family-name:var(--font-body)] text-xs italic text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
              Tap to start the booth
            </span>
          </span>
        </button>
      ) : (
        <>
          <div className="hall-booth-main">
            <div className="hall-booth-eq" aria-hidden data-playing={playing}>
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.2em] uppercase text-[var(--vassal-gold)]">
                Now playing · {playbackLabel(playback)}
              </p>
              <p className="hall-booth-marquee mt-1 font-[family-name:var(--font-display)] text-sm tracking-[0.06em]">
                <span>
                  {active?.title}
                  {active?.artist ? ` — ${active.artist}` : ""}
                  {active?.by ? ` · queued by ${active.by}` : ""}
                </span>
              </p>

              {canNativePlay && playback.kind === "audio" && active ? (
                <NativeAudioControls
                  key={active.id}
                  src={playback.src}
                  autoPlay
                  apiRef={audioApiRef}
                  onPlayingChange={setPlaying}
                  onError={(msg) => {
                    setPlaying(false);
                    setError(msg);
                  }}
                  onEnded={() => {
                    setPlaying(false);
                    if (tracks.length > 1) playNext();
                  }}
                />
              ) : (
                <p className="mt-1 font-[family-name:var(--font-body)] text-xs italic text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]">
                  {canEmbed
                    ? "Open the stage below to hear this track."
                    : playback.kind === "link"
                      ? "This link opens on its own stage."
                      : "Add a media link to play in the booth."}
                </p>
              )}
              {error ? (
                <p className="mt-1 font-[family-name:var(--font-body)] text-xs text-[var(--vassal-blood)]">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="hall-booth-controls">
              <button
                type="button"
                className="hall-booth-btn"
                onClick={playPrev}
                disabled={tracks.length < 2}
                aria-label="Previous track"
              >
                ‹‹
              </button>
              <button
                type="button"
                className="hall-booth-btn hall-booth-btn-play"
                onClick={() => {
                  if (canNativePlay && audioApiRef.current) {
                    if (audioApiRef.current.paused()) {
                      void audioApiRef.current.play().then(
                        () => setPlaying(true),
                        () => {
                          setPlaying(false);
                          setError(
                            "Could not start audio — check the track link.",
                          );
                        },
                      );
                    } else {
                      audioApiRef.current.pause();
                      setPlaying(false);
                    }
                    return;
                  }
                  setError(null);
                  if (canEmbed || playback.kind === "link") {
                    setExpanded(true);
                    setPlaying(true);
                    return;
                  }
                  setError("This track has no playable link yet.");
                }}
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing && canNativePlay ? "❚❚" : "▶"}
              </button>
              <button
                type="button"
                className="hall-booth-btn"
                onClick={playNext}
                disabled={tracks.length < 2}
                aria-label="Next track"
              >
                ››
              </button>
              {canEmbed || playback.kind === "link" ? (
                <button
                  type="button"
                  className="hall-booth-btn hall-booth-btn-stage"
                  onClick={() => {
                    if (playback.kind === "link") {
                      window.open(playback.href, "_blank", "noreferrer");
                      return;
                    }
                    setExpanded((v) => !v);
                    setPlaying(true);
                  }}
                  aria-expanded={expanded}
                >
                  {playback.kind === "link"
                    ? "Open"
                    : expanded
                      ? "Hide"
                      : "Stage"}
                </button>
              ) : null}
            </div>
          </div>

          {expanded && canEmbed ? (
            <div className="hall-booth-stage">
              <iframe
                key={`${reactId}-${active?.id}`}
                title={`${active?.title || "Track"} stage`}
                src={
                  playback.kind === "youtube"
                    ? `${playback.embedSrc}&autoplay=1`
                    : playback.kind === "soundcloud"
                      ? playback.embedSrc.replace(
                          "auto_play=false",
                          "auto_play=true",
                        )
                      : playback.embedSrc
                }
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
              {"watchUrl" in playback ? (
                <a
                  href={playback.watchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hall-booth-external"
                >
                  Open on {playbackLabel(playback)}
                </a>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </aside>
  );
}

function NativeAudioControls({
  src,
  autoPlay,
  apiRef,
  onPlayingChange,
  onError,
  onEnded,
}: {
  src: string;
  autoPlay: boolean;
  apiRef: MutableRefObject<{
    play: () => Promise<void>;
    pause: () => void;
    paused: () => boolean;
  } | null>;
  onPlayingChange: (playing: boolean) => void;
  onError: (message: string) => void;
  onEnded: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const startedRef = useRef(false);
  const progress =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="hall-booth-seek mt-2">
      <audio
        ref={(node) => {
          audioRef.current = node;
          if (!node) {
            apiRef.current = null;
            return;
          }
          apiRef.current = {
            play: () => node.play(),
            pause: () => node.pause(),
            paused: () => node.paused,
          };
          if (autoPlay && !startedRef.current) {
            startedRef.current = true;
            void node.play().then(
              () => onPlayingChange(true),
              () => onPlayingChange(false),
            );
          }
        }}
        src={src}
        preload="metadata"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onEnded={onEnded}
        onPlay={() => onPlayingChange(true)}
        onPause={() => onPlayingChange(false)}
        onError={() => onError("Audio failed to load from that link.")}
      />
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={currentTime}
        onChange={(e) => {
          const value = Number(e.target.value);
          const audio = audioRef.current;
          if (audio) audio.currentTime = value;
          setCurrentTime(value);
        }}
        aria-label="Seek"
        style={
          {
            "--booth-progress": `${progress}%`,
          } as CSSProperties
        }
      />
      <div className="hall-booth-times">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
