"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getLexiconEntry,
  LEXICON,
  type LexiconTermId,
} from "../lib/lexicon";

type LexiconContextValue = {
  openLexicon: (termId?: LexiconTermId | string | null) => void;
  closeLexicon: () => void;
};

const LexiconContext = createContext<LexiconContextValue | null>(null);

export function useLexicon() {
  const ctx = useContext(LexiconContext);
  if (!ctx) {
    throw new Error("useLexicon must be used within LexiconProvider");
  }
  return ctx;
}

export function LexiconProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);

  const openLexicon = useCallback((termId?: LexiconTermId | string | null) => {
    setFocusId(termId ?? null);
    setOpen(true);
  }, []);

  const closeLexicon = useCallback(() => {
    setOpen(false);
    setFocusId(null);
  }, []);

  return (
    <LexiconContext.Provider value={{ openLexicon, closeLexicon }}>
      {children}
      <LexiconPanel
        open={open}
        focusId={focusId}
        onClose={closeLexicon}
        onFocus={setFocusId}
      />
    </LexiconContext.Provider>
  );
}

/** Underlined term that opens the appendix on that entry. */
export function LexiconTerm({
  id,
  children,
}: {
  id: LexiconTermId;
  children: ReactNode;
}) {
  const { openLexicon } = useLexicon();
  const entry = getLexiconEntry(id);
  return (
    <button
      type="button"
      onClick={() => openLexicon(id)}
      className="lexicon-term"
      title={entry ? `${entry.term}: ${entry.plain}` : undefined}
    >
      {children}
    </button>
  );
}

function LexiconPanel({
  open,
  focusId,
  onClose,
  onFocus,
}: {
  open: boolean;
  focusId: string | null;
  onClose: () => void;
  onFocus: (id: string) => void;
}) {
  const titleId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !focusId || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-term="${focusId}"]`);
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [open, focusId]);

  if (!open) return null;

  const focused = getLexiconEntry(focusId);

  return (
    <div className="lexicon-root" role="presentation">
      <button
        type="button"
        className="lexicon-veil"
        aria-label="Close lexicon"
        onClick={onClose}
      />
      <div
        className="lexicon-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="lexicon-header">
          <div>
            <p className="lexicon-eyebrow">Appendix</p>
            <h2 id={titleId} className="lexicon-title">
              Lexicon
            </h2>
            <p className="lexicon-lead">
              Tap a word anywhere it&apos;s marked, or browse the list.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="lexicon-close"
          >
            Close
          </button>
        </div>

        {focused ? (
          <div className="lexicon-focus" data-term={focused.id}>
            <p className="lexicon-term-name">{focused.term}</p>
            <p className="lexicon-plain">{focused.plain}</p>
            <p className="lexicon-detail">{focused.detail}</p>
          </div>
        ) : null}

        <div ref={listRef} className="lexicon-list">
          {LEXICON.map((entry) => {
            const active = entry.id === focusId;
            return (
              <button
                key={entry.id}
                type="button"
                data-term={entry.id}
                onClick={() => onFocus(entry.id)}
                className={`lexicon-row ${active ? "lexicon-row-active" : ""}`}
              >
                <span className="lexicon-row-term">{entry.term}</span>
                <span className="lexicon-row-plain">{entry.plain}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
