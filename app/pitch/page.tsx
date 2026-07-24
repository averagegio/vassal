import type { Metadata } from "next";
import { PitchDeck } from "../components/PitchDeck";

export const metadata: Metadata = {
  title: "Pitch — Vassal",
  description:
    "Projected earnings, scale marketing, and step-by-step how to use Vassal for Fan Court and Estate holdings.",
};

export default function PitchPage() {
  return <PitchDeck />;
}
