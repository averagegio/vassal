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
      {/* Mount under the intro so the transition feels continuous;
          only start gate/lamp choreography once the intro has cleared. */}
      {(entered || introGone) && <LandingPage active={introGone} />}
    </div>
  );
}
