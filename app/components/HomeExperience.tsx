"use client";

import { useCallback, useState } from "react";
import { IntroScreen } from "./IntroScreen";
import { LandingPage } from "./LandingPage";

export function HomeExperience() {
  const [entered, setEntered] = useState(false);
  const [introGone, setIntroGone] = useState(false);

  const handleEnter = useCallback(() => {
    setEntered(true);
  }, []);

  const handleIntroFinished = useCallback(() => {
    setIntroGone(true);
  }, []);

  return (
    <div className="relative min-h-dvh bg-[var(--vassal-black)] text-[var(--vassal-cream)]">
      {!introGone && (
        <IntroScreen
          exiting={entered}
          onEnter={handleEnter}
          onExitComplete={handleIntroFinished}
        />
      )}
      {(entered || introGone) && <LandingPage active={entered || introGone} />}
    </div>
  );
}
