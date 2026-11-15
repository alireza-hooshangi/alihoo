import type { MetadataRoute } from "next";
import { getSeoSettings } from "@/sanity/lib/content";
export const revalidate = 30;
export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSeoSettings();
  return { rules: { userAgent: "*", allow: "/" }, sitemap: new URL("/sitemap.xml", settings.siteUrl).href };
}
