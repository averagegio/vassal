"use client";

import { useEffect, useState } from "react";
import type { ScrollKind, ScrollPublic } from "../lib/scroll-types";

type ScrollComposerProps = {
  kind: ScrollKind;
  courtSlug?: string;
  /** Shown above the form. */
  heading?: string;
  subtitle?: string;
};

export function ScrollComposer({
  kind,
  courtSlug,
  heading,
  subtitle,
}: ScrollComposerProps) {
  const [title, setTitle] = useState("");
  const [greeting, setGreeting] = useState("");
  const [body, setBody] = useState("");
  const [signOff, setSignOff] = useState("");
  const [nomineeName, setNomineeName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sealed, setSealed] = useState<ScrollPublic | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/scrolls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind,
            courtSlug,
            defaultsOnly: true,
          }),
        });
        const json = (await res.json()) as {
          defaults?: {
            title: string;
            greeting: string;
            body: string;
            signOff: string;
          };
        };
        if (cancelled || !res.ok || !json.defaults) return;
        setTitle((prev) => prev || json.defaults!.title);
        setGreeting((prev) => prev || json.defaults!.greeting);
        setBody((prev) => prev || json.defaults!.body);
        setSignOff((prev) => prev || json.defaults!.signOff);
      } catch {
        /* ignore — user can still type */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kind, courtSlug]);

  const shareUrl =
    typeof window !== "undefined" && sealed
      ? `${window.location.origin}/scroll/${sealed.token}`
      : sealed
        ? `/scroll/${sealed.token}`
        : "";

  const seal = async () => {
    setBusy(true);
    setError("");
    setCopied(false);
    try {
      const res = await fetch("/api/scrolls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          courtSlug,
          title,
          greeting,
          body,
          signOff,
          nomineeName: kind === "nominate_lord" ? nomineeName : undefined,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        scroll?: ScrollPublic;
      };
      if (!res.ok || !json.scroll) {
        setError(json.error || "Could not seal scroll.");
        return;
      }
      setSealed(json.scroll);
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setError("Could not copy — select the link manually.");
    }
  };

  const defaultHeading =
    kind === "vassal" ? "Vassal summons" : "Nominate a Lord";
  const defaultSubtitle =
    kind === "vassal"
      ? "Write a parchment invite and send the link to people you want in the retinue."
      : "Write a scroll nominating a creator to open their own hall as Lord.";

  return (
    <div className="scroll-composer">
      <h3 className="font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
        {heading || defaultHeading}
      </h3>
      <p className="mt-1 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_65%,transparent)]">
        {subtitle || defaultSubtitle}
      </p>

      {kind === "nominate_lord" ? (
        <label className="mt-4 block">
          <span className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.14em] uppercase text-[var(--vassal-gold)]">
            Nominee name
          </span>
          <input
            value={nomineeName}
            onChange={(e) => setNomineeName(e.target.value)}
            placeholder="Who should open a hall?"
            className="auth-input mt-2 w-full border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
          />
        </label>
      ) : null}

      <label className="mt-3 block">
        <span className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.14em] uppercase text-[var(--vassal-gold)]">
          Title
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="auth-input mt-2 w-full border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
        />
      </label>
      <label className="mt-3 block">
        <span className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.14em] uppercase text-[var(--vassal-gold)]">
          Greeting
        </span>
        <input
          value={greeting}
          onChange={(e) => setGreeting(e.target.value)}
          className="auth-input mt-2 w-full border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
        />
      </label>
      <label className="mt-3 block">
        <span className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.14em] uppercase text-[var(--vassal-gold)]">
          Body
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="auth-input mt-2 w-full resize-y border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2 font-[family-name:var(--font-body)]"
        />
      </label>
      <label className="mt-3 block">
        <span className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.14em] uppercase text-[var(--vassal-gold)]">
          Sign-off
        </span>
        <input
          value={signOff}
          onChange={(e) => setSignOff(e.target.value)}
          className="auth-input mt-2 w-full border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-transparent px-3 py-2"
        />
      </label>

      {error ? (
        <p className="mt-3 text-[0.7rem] text-[var(--vassal-blood)]">{error}</p>
      ) : null}

      <button
        type="button"
        disabled={busy}
        onClick={() => void seal()}
        className="mt-4 border border-[color-mix(in_srgb,var(--vassal-gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_28%,transparent)] px-4 py-2.5 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase disabled:opacity-60"
      >
        {busy ? "Sealing…" : sealed ? "Seal another scroll" : "Seal scroll"}
      </button>

      {sealed ? (
        <div className="scroll-share mt-4">
          <p className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.16em] uppercase text-[var(--vassal-gold)]">
            Scroll sealed — share this link
          </p>
          <p className="mt-2 break-all font-[family-name:var(--font-body)] text-sm text-[color-mix(in_srgb,var(--vassal-cream)_85%,transparent)]">
            {shareUrl}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyLink()}
              className="border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] px-3 py-2 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
            <a
              href={`/scroll/${sealed.token}`}
              target="_blank"
              rel="noreferrer"
              className="border border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] px-3 py-2 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.14em] uppercase"
            >
              Preview
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
