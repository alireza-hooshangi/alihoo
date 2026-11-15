import type { MetadataRoute } from "next";
import { getProjects, getSeoSettings } from "@/sanity/lib/content";
export const revalidate = 30;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, projects] = await Promise.all([getSeoSettings(), getProjects()]);
  if (settings.seo.noIndex) return [];
  return [
    { url: new URL("/", settings.siteUrl).href },
    ...(!settings.projectsSeo.noIndex ? [{ url: new URL("/projects", settings.siteUrl).href }] : []),
    ...projects.filter(project => !project.seo?.noIndex).map(project => ({
      url: new URL(`/${encodeURIComponent(project.slug || project.id)}`, settings.siteUrl).href,
      lastModified: project.updatedAt,
    })),
  ];
}
