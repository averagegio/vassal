import type { Metadata } from "next";
import { DashboardShell } from "../components/DashboardShell";

export const metadata: Metadata = {
  title: "Dashboard — Vassal",
  description: "Your landlord solar: petitions, tenants, and Steward pulse.",
};

export default function DashboardPage() {
  return <DashboardShell />;
}
