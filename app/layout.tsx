import type { Metadata } from "next";
import { Cinzel, IM_Fell_English } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const imFell = IM_Fell_English({
  variable: "--font-im-fell",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Vassal — AI for creator communities & rentals",
  description:
    "Vassal helps creators run paid fan communities and hosts manage rentals — with an AI Steward that drafts updates in your voice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${imFell.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
