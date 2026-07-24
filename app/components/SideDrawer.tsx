"use client";

import Link from "next/link";
import { VassalLogo } from "./VassalLogo";

type SideDrawerProps = {
  open: boolean;
  visible: boolean;
  onOpen: () => void;
  onClose: () => void;
};

const LINKS = [
  { href: "#realm", label: "Realm" },
  { href: "#paths", label: "Holdings" },
  { href: "#fan-holding", label: "Fan Court" },
  { href: "#estate-holding", label: "Estate" },
  { href: "#steward", label: "Steward" },
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up" },
];

export function SideDrawer({ open, visible, onOpen, onClose }: SideDrawerProps) {
  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="vassal-drawer"
        onClick={() => (open ? onClose() : onOpen())}
        className={`hamburger-btn fixed left-4 top-4 z-[60] flex h-11 w-11 flex-col items-center justify-center gap-1.5 sm:left-6 sm:top-6 ${
          visible || open ? "visible" : "hidden-nav"
        }`}
      >
        <span
          className={`block h-0.5 w-5 bg-[var(--vassal-cream)] transition ${
            open ? "translate-y-[7px] rotate-45" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-[var(--vassal-cream)] transition ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-[var(--vassal-cream)] transition ${
            open ? "-translate-y-[7px] -rotate-45" : ""
          }`}
        />
      </button>

      <div
        className={`fixed inset-0 z-[55] bg-black/60 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        id="vassal-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={`drawer-panel fixed left-0 top-0 z-[58] flex h-dvh w-[min(86vw,320px)] flex-col px-7 py-20 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3">
          <VassalLogo size={40} />
          <p className="font-[family-name:var(--font-display)] text-xl tracking-[0.28em] text-[var(--vassal-cream)]">
            VASSAL
          </p>
        </div>
        <div className="mt-3 h-px w-16 bg-[var(--vassal-red)]" />
        <nav className="mt-10 flex flex-col gap-5">
          {LINKS.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="font-[family-name:var(--font-display)] text-sm tracking-[0.18em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_85%,transparent)] transition hover:text-[var(--vassal-blood)]"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="font-[family-name:var(--font-display)] text-sm tracking-[0.18em] uppercase text-[color-mix(in_srgb,var(--vassal-cream)_85%,transparent)] transition hover:text-[var(--vassal-blood)]"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>
        <p className="mt-auto font-[family-name:var(--font-body)] text-sm italic text-[color-mix(in_srgb,var(--vassal-cream)_50%,transparent)]">
          Swear. Seal. Rise.
        </p>
      </aside>
    </>
  );
}
