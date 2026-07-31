import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "../components/AuthForm";
import { getAppViewer } from "../lib/viewer";

export const metadata: Metadata = {
  title: "Log in — Vassal",
  description: "Return to your Vassal holding.",
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const viewer = await getAppViewer();
  if (viewer) redirect(viewer.homeHref);
  return <AuthForm mode="login" />;
}
