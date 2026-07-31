"use client";

import { useCallback, useEffect, useState } from "react";
import { IntroScreen } from "./IntroScreen";
import { LandingPage } from "./LandingPage";

type HomeExperienceProps = {
  /** Arrive already past the intro (e.g. Back / Vassal from auth). */
  skipIntro?: boolean;
};

export function HomeExperience({ skipIntro = false }: HomeExperienceProps) {
  const [entered, setEntered] = useState(skipIntro);
  const [introGone, setIntroGone] = useState(skipIntro);

  useEffect(() => {
    if (!skipIntro || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has("enter")) return;
    url.searchParams.delete("enter");
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, "", next || "/");
  }, [skipIntro]);

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
      {(entered || introGone) && (
        <LandingPage active={introGone} skipChoreography={skipIntro} />
      )}
    </div>
  );
}
