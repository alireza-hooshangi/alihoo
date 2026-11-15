import { getProjects, getSeoSettings } from "@/sanity/lib/content";
import { pageMetadata } from "@/sanity/lib/seo";
import { Projects } from "../../portfolio";

export async function generateMetadata() {
  const settings = await getSeoSettings();
  return pageMetadata(settings, "/projects", `Projects — ${settings.siteName}`, "Independent projects, experiments, and product concepts by Alihoo.", settings.projectsSeo);
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <Projects projects={projects} />;
}
