import { pageMetadata } from "@/sanity/lib/seo";
import { ProjectsLoader } from "../portfolio";
import { getSiteContent, getSeoSettings } from "@/sanity/lib/content";

export default async function Home() {
  const { loaderSlides } = await getSiteContent();
  return <ProjectsLoader key={loaderSlides.map((slide) => slide.src).join()} slides={loaderSlides} />;
}

export async function generateMetadata() {
  const [settings, content] = await Promise.all([getSeoSettings(), getSiteContent()]);
  return pageMetadata(settings, "/", `${settings.siteName} — Independent projects & experiments`, content.bio.join(" "), settings.seo);
}
