"use client";

import { useState, type FormEvent } from "react";

type PetitionComposeProps = {
  /** Court slug when petitioning your Lord. */
  courtSlug?: string;
  /** Profile handle when petitioning a holding owner. */
  toHandle?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  onFiled?: () => void;
};

export function PetitionCompose({
  courtSlug,
  toHandle,
  eyebrow = "Petition",
  title = "Make a petition",
  subtitle = "Ask your landlord. They seal grant, defer, or deny.",
  onFiled,
}: PetitionComposeProps) {
  const [ask, setAsk] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = ask.trim();
    if (!text) {
      setMessage({ type: "err", text: "Write your ask." });
      return;
    }
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/petitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ask: text,
          ...(courtSlug ? { courtSlug } : {}),
          ...(toHandle ? { toHandle } : {}),
        }),
      });
      const json = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setMessage({
          type: "err",
          text:
            res.status === 401
              ? "Log in to file a petition."
              : json?.error || "Could not file petition.",
        });
        return;
      }
      setAsk("");
      setMessage({ type: "ok", text: "Petition filed. Await their seal." });
      onFiled?.();
    } catch {
      setMessage({ type: "err", text: "Could not reach the realm." });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.22em] uppercase text-[var(--vassal-gold)]">
        {eyebrow}
      </p>
      <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl tracking-[0.1em] text-[var(--vassal-cream)]">
        {title}
      </h3>
      <p className="mt-2 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)]">
        {subtitle}
      </p>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-5 flex flex-col gap-3">
        <label className="flex flex-col gap-2" htmlFor="petition-ask">
          <span className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.22em] uppercase text-[var(--vassal-gold)]">
            Your ask
          </span>
          <textarea
            id="petition-ask"
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Access, a repair, a favor, an audience…"
            className="auth-input resize-y border border-[color-mix(in_srgb,var(--vassal-gold)_30%,transparent)] bg-[color-mix(in_srgb,var(--vassal-black)_70%,transparent)] px-3 py-2.5 font-[family-name:var(--font-body)] text-[var(--vassal-cream)] outline-none transition focus:border-[var(--vassal-blood)]"
          />
          <span className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.14em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_40%,transparent)]">
            {ask.trim().length}/500
          </span>
        </label>

        {message ? (
          <p
            role="status"
            className={`font-[family-name:var(--font-display)] text-xs tracking-[0.08em] ${
              message.type === "ok"
                ? "text-[var(--vassal-gold)]"
                : "text-[var(--vassal-blood)]"
            }`}
          >
            {message.text}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 self-start border border-[color-mix(in_srgb,var(--vassal-gold)_50%,transparent)] bg-[color-mix(in_srgb,var(--vassal-red)_40%,transparent)] px-5 py-2.5 font-[family-name:var(--font-display)] text-xs tracking-[0.22em] uppercase text-[var(--vassal-cream)] transition hover:bg-[color-mix(in_srgb,var(--vassal-red)_55%,transparent)] disabled:opacity-60"
        >
          {pending ? "Filing…" : "File petition"}
        </button>
      </form>
    </div>
  );
}
