import type { Metadata } from "next";
import type { ImageSlide } from "../../app/content";

export type SeoFields = { title?: string; description?: string; image?: ImageSlide; noIndex?: boolean };
export function pageMetadata(settings: { siteName: string; siteUrl: string; seo: SeoFields }, path: string, title: string, description: string, seo: SeoFields = {}, cover?: ImageSlide): Metadata {
  const image = seo.image || cover || settings.seo.image;
  const resolvedTitle = seo.title || title;
  const resolvedDescription = seo.description || description;
  const url = new URL(path, settings.siteUrl).href;
  const images = image ? [{ url: new URL(image.src, settings.siteUrl).href, alt: image.alt }] : undefined;
  return {
    title: { absolute: resolvedTitle }, description: resolvedDescription,
    alternates: { canonical: url },
    robots: { index: !(settings.seo.noIndex || seo.noIndex), follow: true },
    openGraph: { type: "website", siteName: settings.siteName, title: resolvedTitle, description: resolvedDescription, url, images },
    twitter: { card: image ? "summary_large_image" : "summary", title: resolvedTitle, description: resolvedDescription, images },
  };
}
