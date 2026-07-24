import type { Metadata } from "next";
import { AuthForm } from "../components/AuthForm";

export const metadata: Metadata = {
  title: "Sign up — Vassal",
  description: "Open a Fan Court or Estate Holding on Vassal.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
