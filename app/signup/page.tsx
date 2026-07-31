import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "../components/AuthForm";
import { getAppViewer } from "../lib/viewer";

export const metadata: Metadata = {
  title: "Sign up — Vassal",
  description: "Open a Fan Court or Estate Holding on Vassal.",
};

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const viewer = await getAppViewer();
  if (viewer) redirect(viewer.homeHref);
  return <AuthForm mode="signup" />;
}
