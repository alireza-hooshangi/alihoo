import "server-only";
import { cache } from "react";
import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import { apiVersion, dataset, isSanityConfigured, projectId } from "../env";
import { bio, contact, loaderSlides, projects, type ImageSlide, type Project, type Slide } from "@/app/content";

export type SiteContent = { bio: readonly string[]; contact: { studio: string; email: string }; loaderSlides: readonly ImageSlide[] };
type CmsImage = { _type: "imageSlide"; alt: string; asset?: { _ref: string } };
type CmsVideo = { _type: "videoSlide"; alt: string; url?: string; poster?: CmsImage };
type CmsProject = { _id: string; title: string; cover?: CmsImage; paragraphs: string[]; slides: (CmsImage | CmsVideo)[] };
type CmsSettings = { bio?: string[]; email?: string; studioUrl?: string; loaderImages?: CmsImage[] };
const client = isSanityConfigured ? createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "published", token: process.env.SANITY_API_READ_TOKEN }) : null;
const imageBuilder = client ? createImageUrlBuilder(client) : null;
function imageUrl(image?: CmsImage, width = 2400) {
  return image?.asset?._ref && imageBuilder ? imageBuilder.image(image).width(width).fit("max").auto("format").url() : undefined;
}
function toSlide(slide: CmsImage | CmsVideo): Slide | null {
  if (slide._type === "videoSlide") return slide.url ? { type: "video", src: slide.url, alt: slide.alt || "Project video", poster: imageUrl(slide.poster) } : null;
  const src = imageUrl(slide);
  return src ? { type: "image", src, alt: slide.alt || "Project image" } : null;
}
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  if (!client) return { bio, contact, loaderSlides };
  const settings = await client.fetch<CmsSettings | null>('*[_type == "siteSettings" && _id == "siteSettings"][0]{bio,email,studioUrl,loaderImages}', {}, { next: { revalidate: 30 } });
  return {
    bio: settings?.bio ?? bio,
    contact: { studio: settings?.studioUrl ?? contact.studio, email: settings?.email ?? contact.email },
    loaderSlides: settings?.loaderImages?.flatMap((image) => {
      const src = imageUrl(image, 160);
      return src ? [{ src, alt: image.alt || "Project preview" }] : [];
    }) ?? loaderSlides,
  };
});
export const getProjects = cache(async (): Promise<Project[]> => {
  if (!client) return projects;
  const documents = await client.fetch<CmsProject[]>('*[_type == "project"] | order(order asc, _createdAt asc){_id,title,cover,paragraphs,slides[]{...,"url":file.asset->url}}', {}, { next: { revalidate: 30 } });
  return documents.flatMap((document) => {
    const slides = (document.slides ?? []).map(toSlide).filter((slide): slide is Slide => slide !== null);
    if (!slides.length) return [];
    const coverSrc = imageUrl(document.cover);
    const cover: ImageSlide | undefined = coverSrc ? { src: coverSrc, alt: document.cover?.alt || document.title } : undefined;
    return [{ cover, id: document._id, name: document.title, paragraphs: document.paragraphs ?? [], slides: slides as [Slide, ...Slide[]] }];
  });
});
