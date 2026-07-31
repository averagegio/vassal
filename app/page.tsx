import { HomeExperience } from "./components/HomeExperience";
import { shouldSkipIntro } from "./lib/home";

type HomeProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  return <HomeExperience skipIntro={shouldSkipIntro(params)} />;
}
