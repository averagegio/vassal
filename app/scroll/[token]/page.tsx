import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScrollInvite } from "../../components/ScrollInvite";
import { getScrollByToken } from "../../lib/scrolls";

type PageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { token } = await params;
  const scroll = await getScrollByToken(token);
  if (!scroll) {
    return { title: "Scroll not found · Vassal" };
  }
  return {
    title: `${scroll.title} · Vassal`,
    description: scroll.body.slice(0, 140),
  };
}

export default async function ScrollPage({ params }: PageProps) {
  const { token } = await params;
  const scroll = await getScrollByToken(token);
  if (!scroll) notFound();
  return <ScrollInvite scroll={scroll} />;
}
