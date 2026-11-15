import { ProjectsLoader } from "../portfolio";
import { getSiteContent } from "@/sanity/lib/content";

export default async function Home() {
  const { loaderSlides } = await getSiteContent();
  return <ProjectsLoader key={loaderSlides.map((slide) => slide.src).join()} slides={loaderSlides} />;
}
