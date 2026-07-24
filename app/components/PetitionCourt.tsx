"use client";

import { useCallback, useState, type ReactNode } from "react";
import type { Petition } from "../lib/features";

type PetitionCourtProps = {
  title: string;
  subtitle: string;
  seed: Petition[];
  grantLabel?: string;
  persist?: boolean;
};

const STATUS_LABEL: Record<Petition["status"], string> = {
  open: "Open",
  granted: "Granted",
  denied: "Denied",
  deferred: "Deferred",
};

export function PetitionCourt({
  title,
  subtitle,
  seed,
  grantLabel = "Grant",
  persist = false,
}: PetitionCourtProps) {
  const [items, setItems] = useState(seed);

  const seal = useCallback(
    async (id: string, status: Petition["status"]) => {
      setItems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p)),
      );
      if (!persist) return;
      try {
        const res = await fetch("/api/petitions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status }),
        });
        if (!res.ok) {
          setItems(seed);
        }
      } catch {
        setItems(seed);
      }
    },
    [persist, seed],
  );

  return (
    <div className="petition-court w-full max-w-lg">
      <div className="mb-6 text-center sm:text-left">
        <h3 className="font-[family-name:var(--font-display)] text-xl tracking-[0.1em] text-[var(--vassal-cream)]">
          {title}
        </h3>
        <p className="mt-2 font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_70%,transparent)]">
          {subtitle}
        </p>
      </div>

      <ul className="flex flex-col gap-4" aria-label="Petition board">
        {items.map((petition) => (
          <li key={petition.id} className="petition-row">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.06em] text-[var(--vassal-cream)]">
                {petition.from}
              </p>
              <span
                className={`font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.2em] uppercase ${
                  petition.status === "open"
                    ? "text-[var(--vassal-gold)]"
                    : petition.status === "granted"
                      ? "text-[var(--vassal-ember)]"
                      : petition.status === "denied"
                        ? "text-[var(--vassal-blood)]"
                        : "text-[color-mix(in_srgb,var(--vassal-cream)_55%,transparent)]"
                }`}
              >
                {STATUS_LABEL[petition.status]}
              </span>
            </div>
            <p className="mt-1 font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.16em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_45%,transparent)]">
              {petition.rank}
            </p>
            <p className="mt-3 font-[family-name:var(--font-body)] text-sm leading-relaxed text-[color-mix(in_srgb,var(--vassal-cream)_80%,transparent)]">
              {petition.ask}
            </p>

            {petition.status === "open" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <SealButton onClick={() => seal(petition.id, "granted")}>
                  {grantLabel}
                </SealButton>
                <SealButton onClick={() => seal(petition.id, "deferred")}>
                  Defer
                </SealButton>
                <SealButton onClick={() => seal(petition.id, "denied")} tone="blood">
                  Deny
                </SealButton>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SealButton({
  children,
  onClick,
  tone = "gold",
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "gold" | "blood";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border bg-transparent px-3 py-1.5 font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.18em] uppercase text-[var(--vassal-cream)] transition ${
        tone === "blood"
          ? "border-[color-mix(in_srgb,var(--vassal-blood)_55%,transparent)] hover:border-[var(--vassal-blood)] hover:bg-[color-mix(in_srgb,var(--vassal-red)_25%,transparent)]"
          : "border-[color-mix(in_srgb,var(--vassal-gold)_40%,transparent)] hover:border-[var(--vassal-gold)] hover:bg-[color-mix(in_srgb,var(--vassal-gold)_12%,transparent)]"
      }`}
    >
      {children}
    </button>
  );
}
