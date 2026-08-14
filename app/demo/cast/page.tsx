import type { Metadata } from "next";
import { DemoCast } from "../../components/DemoCast";

export const metadata: Metadata = {
  title: "Demo cast — Vassal",
  description:
    "Investor video demo cast: Fan Court and Estate personas, storyboard scenes, and seed logins.",
};

export default function DemoCastPage() {
  return <DemoCast />;
}
