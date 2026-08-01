import type { Metadata } from "next";
import { PitchDeck } from "../components/PitchDeck";

export const metadata: Metadata = {
  title: "Pitch — Vassal",
  description:
    "Vassal pitch: Steward catch, site flow, TAM, MRR/ARR projections, funding path, and recurring growth plan.",
};

export default function PitchPage() {
  return <PitchDeck />;
}
