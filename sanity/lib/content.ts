import "server-only";
import { cache } from "react";
import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import { apiVersion, dataset, isSanityConfigured, projectId } from "../env";
import { bio, contact, bioLinks, loaderSlides, projects, type BioLink, type ImageSlide, type Project, type Slide } from "@/app/content";

import { orderProjects, isSafeBioHref } from "./presentation";

export type SiteContent = { bio: readonly string[]; links: readonly BioLink[]; loaderSlides: readonly ImageSlide[] };
type CmsImage = { _type: "imageSlide"; alt: string; preview?: string; asset?: { _ref: string } };
type CmsVideo = { _type: "videoSlide"; alt: string; url?: string; poster?: CmsImage };
type CmsProject = { _id: string; _updatedAt?: string; slug?: { current: string }; seo?: { title?: string; description?: string; image?: CmsImage; noIndex?: boolean }; title: string; cover?: CmsImage; paragraphs: string[]; slides: (CmsImage | CmsVideo)[] };
type CmsBio = { paragraphs?: string[]; links?: BioLink[] };
type CmsSettings = { bio?: string[]; email?: string; studioUrl?: string; loaderImages?: CmsImage[] };
const client = isSanityConfigured ? createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "published", token: process.env.SANITY_API_READ_TOKEN }) : null;
const imageBuilder = client ? createImageUrlBuilder(client) : null;
function imageUrl(image?: CmsImage, width = 2400) {
  return image?.asset?._ref && imageBuilder ? imageBuilder.image(image).width(width).fit("max").auto("format").url() : undefined;
}
function toSlide(slide: CmsImage | CmsVideo): Slide | null {
  if (slide._type === "videoSlide") return slide.url ? { type: "video", src: slide.url, alt: slide.alt || "Project video", poster: imageUrl(slide.poster) } : null;
  const src = imageUrl(slide);
  return src ? { type: "image", src, preview: slide.preview, alt: slide.alt || "Project image" } : null;
}
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  if (!client) return { bio, links: bioLinks, loaderSlides };
  const { settings, profile } = await client.fetch<{ settings: CmsSettings | null; profile: CmsBio | null }>(
    '{"settings":*[_id == "siteSettings"][0]{bio,email,studioUrl,loaderImages},"profile":*[_id == "bio"][0]{paragraphs,links}}', {}, { next: { revalidate: 30 } });
  const legacyLinks = bioLinks.map((link) => ({ ...link, href: link._key === "email" ? `mailto:${settings?.email ?? contact.email}` : settings?.studioUrl ?? contact.studio }));
  return {
    bio: profile ? profile.paragraphs ?? [] : settings?.bio ?? bio,
    links: (profile ? profile.links ?? [] : legacyLinks).filter((link) => link.label && isSafeBioHref(link.href)),
    loaderSlides: settings?.loaderImages?.flatMap((image) => {
      const src = imageUrl(image, 160);
      return src ? [{ src, alt: image.alt || "Project preview" }] : [];
    }) ?? loaderSlides,
  };
});
export const getProjects = cache(async (): Promise<Project[]> => {
  if (!client) return projects;
  const result = await client.fetch<{ projects: CmsProject[]; order: { _ref: string }[] | null }>(
    '{"projects":*[_type == "project"] | order(order asc, _createdAt asc){_id,_updatedAt,slug,seo,title,cover,paragraphs,slides[]{...,"preview":asset->metadata.lqip,"url":file.asset->url}},"order":*[_id == "projectOrder"][0].projects}', {}, { next: { revalidate: 30 } });
  return orderProjects(result.projects, result.order ?? []).flatMap((document) => {
    const slides = (document.slides ?? []).map(toSlide).filter((slide): slide is Slide => slide !== null);
    if (!slides.length) return [];
    const coverSrc = imageUrl(document.cover);
    const cover: ImageSlide | undefined = coverSrc ? { src: coverSrc, alt: document.cover?.alt || document.title } : undefined;
    return [{ slug: document.slug?.current || document._id, updatedAt: document._updatedAt, seo: { ...document.seo, image: imageUrl(document.seo?.image) ? { src: imageUrl(document.seo?.image)!, alt: document.seo?.image?.alt || document.title } : undefined }, cover, id: document._id, name: document.title, paragraphs: document.paragraphs ?? [], slides: slides as [Slide, ...Slide[]] }];
  });
});

export const getSeoSettings = cache(async () => {
  const settings = client ? await client.fetch<{
    siteName?: string; siteUrl?: string; googleVerification?: string;
    favicon?: CmsImage; faviconUrl?: string; faviconMimeType?: string; appleIcon?: CmsImage;
    seo?: NonNullable<CmsProject["seo"]>; projectsSeo?: NonNullable<CmsProject["seo"]>;
  } | null>('*[_id == "siteSettings"][0]{siteName,siteUrl,googleVerification,favicon,"faviconUrl":favicon.asset->url,"faviconMimeType":favicon.asset->mimeType,appleIcon,seo,projectsSeo}', {}, { next: { revalidate: 30 } }) : null;
  const convertSeo = (value?: NonNullable<CmsProject["seo"]>) => ({ ...value, image: imageUrl(value?.image, 1200) ? { src: imageUrl(value?.image, 1200)!, alt: value?.image?.alt || settings?.siteName || "Alihoo" } : undefined });
  return { siteName: settings?.siteName || "Alihoo", siteUrl: settings?.siteUrl || "https://alihoo-chi.vercel.app", googleVerification: settings?.googleVerification,
    favicon: settings?.faviconUrl || "/favicon.svg", faviconType: settings?.faviconMimeType || "image/svg+xml",
    appleIcon: imageUrl(settings?.appleIcon || (settings?.faviconMimeType !== "image/svg+xml" ? settings?.favicon : undefined), 180) || "/apple-touch-icon.png",
    seo: convertSeo(settings?.seo), projectsSeo: convertSeo(settings?.projectsSeo) };
});
