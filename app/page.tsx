import { HomeExperience } from "./components/HomeExperience";
import { shouldSkipIntro } from "./lib/home";
import { getAppViewer } from "./lib/viewer";

type HomeProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const viewer = await getAppViewer();
  // Signed-in members skip the intro so the realm feels continuous.
  const skipIntro = Boolean(viewer) || shouldSkipIntro(params);

  return (
    <HomeExperience
      skipIntro={skipIntro}
      viewer={
        viewer
          ? {
              name: viewer.name,
              avatarUrl: viewer.avatarUrl,
              homeHref: viewer.homeHref,
            }
          : null
      }
    />
  );
}
