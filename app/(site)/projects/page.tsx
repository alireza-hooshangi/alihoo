import { getProjects } from "@/sanity/lib/content";
import type { Metadata } from "next";
import { Projects } from "../../portfolio";

export const metadata: Metadata = { title: "Projects — Alihoo" };

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <Projects projects={projects} />;
}
