import type { Metadata } from "next";
import { AuthForm } from "../components/AuthForm";

export const metadata: Metadata = {
  title: "Log in — Vassal",
  description: "Return to your Vassal holding.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
