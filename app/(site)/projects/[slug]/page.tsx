import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjects, getSeoSettings } from "@/sanity/lib/content";
import { pageMetadata } from "@/sanity/lib/seo";
import { ProjectSection } from "@/app/portfolio";

type Props = { params: Promise<{ slug: string }> };
async function findProject(params: Props["params"]) {
  const { slug } = await params;
  const project = (await getProjects()).find(project => (project.slug || project.id) === slug);
  if (!project) notFound();
  return project;
}
export async function generateMetadata({ params }: Props) {
  const [project, settings] = await Promise.all([findProject(params), getSeoSettings()]);
  return pageMetadata(settings, `/projects/${encodeURIComponent(project.slug || project.id)}`, `${project.name} — ${settings.siteName}`, project.paragraphs.join(" "), project.seo, project.cover);
}
export default async function ProjectPage({ params }: Props) {
  const project = await findProject(params);
  return <>
    <h1 className="sr-only">{project.name}</h1>
    <div className="projects"><ProjectSection project={project} first /></div>
    <Link className="project-back-link" href="/projects">All projects</Link>
  </>;
}
