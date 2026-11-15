import { defineArrayMember, defineField, defineType } from "sanity";

const altField = defineField({ name: "alt", title: "Description / alt text", type: "string", validation: (rule) => rule.required() });
const paragraphs = defineField({ name: "paragraphs", title: "Description paragraphs", type: "array", of: [defineArrayMember({ type: "text", rows: 3 })], validation: (rule) => rule.required().min(1) });

export const imageSlide = defineType({
  name: "imageSlide", title: "Image", type: "image",
  fields: [altField],
  validation: (rule) => rule.required().assetRequired(),
  preview: { select: { title: "alt", media: "asset" }, prepare: ({ title, media }) => ({ title: title || "Image", media }) },
});
export const videoSlide = defineType({
  name: "videoSlide", title: "Video", type: "object",
  fields: [
    defineField({ name: "file", title: "Video file", type: "file", options: { accept: "video/mp4,video/webm" }, validation: (rule) => rule.required().assetRequired() }),
    defineField({ name: "poster", title: "Poster image", type: "image", description: "Shown before playback and for reduced-motion visitors.", validation: (rule) => rule.required().assetRequired() }),
    altField,
  ],
  preview: { select: { title: "alt", media: "poster" }, prepare: ({ title, media }) => ({ title: title || "Video", subtitle: "Muted looping video", media }) },
});
export const seo = defineType({
  name: "seo", title: "SEO and sharing", type: "object",
  fields: [
    defineField({ name: "title", title: "Search title", type: "string", description: "Leave blank to use the page title.", validation: rule => rule.max(70).warning("Aim for a concise, descriptive title.") }),
    defineField({ name: "description", title: "Search description", type: "text", rows: 3, validation: rule => rule.max(170).warning("Search engines may shorten long descriptions.") }),
    defineField({ name: "image", title: "Social sharing image", type: "image", options: { hotspot: true }, fields: [altField], description: "Recommended: 1200 × 630px. Projects fall back to their cover image." }),
    defineField({ name: "noIndex", title: "Hide from search engines", type: "boolean", initialValue: false, description: "The page remains publicly accessible, but asks search engines not to index it." }),
  ],
});
export const project = defineType({
  name: "project", title: "Project", type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Page URL", type: "slug", options: { source: "title", maxLength: 96 }, validation: rule => rule.required().custom(value => !value?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) ? true : "Use lowercase letters, numbers, and hyphens.") }),
    defineField({ name: "seo", type: "seo" }),
    defineField({ name: "order", title: "Legacy display order", type: "number", hidden: true, readOnly: true }),
    defineField({ name: "cover", title: "Cover image", type: "imageSlide", description: "Project thumbnail. This can be different from the carousel images.", validation: (rule) => rule.required() }),
    paragraphs,
    defineField({ name: "slides", type: "array", description: "Drag to reorder. Images and videos can be mixed in the same carousel.", of: [defineArrayMember({ type: "imageSlide" }), defineArrayMember({ type: "videoSlide" })], validation: (rule) => rule.required().min(1) }),
  ],
  preview: { select: { title: "title", media: "cover", description: "paragraphs.0" }, prepare: ({ title, description, media }) => ({ title, media, subtitle: description }) },
});
export const siteSettings = defineType({
  name: "siteSettings", title: "Site Settings", type: "document",
  fields: [
    defineField({ name: "siteName", title: "Site name", type: "string", initialValue: "Alihoo" }),
    defineField({ name: "siteUrl", title: "Public website URL", type: "url", description: "Your primary deployed domain, without a path. Used for canonical links and the sitemap.", validation: rule => rule.uri({ scheme: ["https"] }).custom(value => { if (!value) return true; try { const url = new URL(value); return url.pathname === "/" && !url.search && !url.hash ? true : "Enter only the domain, without a path, query, or fragment."; } catch { return "Enter a valid URL."; } }) }),
    defineField({ name: "seo", title: "Homepage SEO and defaults", type: "seo" }),
    defineField({ name: "projectsSeo", title: "Projects page SEO", type: "seo" }),
    defineField({ name: "favicon", title: "Favicon", type: "image", description: "Upload an SVG for a crisp vector favicon, or a square PNG. Leave empty to use the original Alihoo Figma SVG." }),
    defineField({ name: "appleIcon", title: "Apple touch icon", type: "image", description: "Square PNG, ideally 180 × 180px. SVG favicons use the matching bundled Apple icon unless you upload one here." }),
    defineField({ name: "googleVerification", title: "Google Search Console verification", type: "string", description: "Paste only the verification code, not the full HTML tag." }),
    defineField({ ...paragraphs, name: "bio", title: "Legacy bio", hidden: true, readOnly: true, validation: undefined }),
    defineField({ name: "email", title: "Legacy email", type: "string", hidden: true, readOnly: true }),
    defineField({ name: "studioUrl", title: "Legacy studio link", type: "url", hidden: true, readOnly: true }),
    defineField({ name: "loaderImages", title: "Homepage loader images", type: "array", hidden: true, readOnly: true, of: [defineArrayMember({ type: "imageSlide" })] }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
export const projectOrder = defineType({
  name: "projectOrder", title: "Project order", type: "document",
  fields: [defineField({
    name: "projects", title: "Project order", type: "array",
    description: "Add projects and drag to reorder the Projects page. Published projects not listed here appear afterward. To hide a project, unpublish it in Projects.",
    of: [defineArrayMember({ type: "reference", to: [{ type: "project" }], weak: true })],
    validation: (rule) => rule.unique(),
  })],
  preview: { prepare: () => ({ title: "Project order" }) },
});
export const bioLink = defineType({
  name: "bioLink", title: "Link", type: "object",
  fields: [
    defineField({ name: "label", title: "Label", description: "For example: Email", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "caption", title: "Caption", description: "The second line, for example: Say hello", type: "string" }),
    defineField({ name: "href", title: "Destination", description: "Use https:// for websites, mailto:hello@alihoo.me for email, or tel: for phone numbers.", type: "url", validation: (rule) => rule.required().uri({ scheme: ["https", "http", "mailto", "tel"] }) }),
    defineField({ name: "newTab", title: "Open in a new tab", type: "boolean", initialValue: false }),
  ],
  preview: { select: { title: "label", subtitle: "caption" } },
});
export const bioPage = defineType({
  name: "bioPage", title: "Bio", type: "document",
  fields: [
    defineField({ ...paragraphs, title: "Bio paragraphs", validation: undefined }),
    defineField({ name: "links", title: "Links", type: "array", description: "Add, remove, or drag links into the order they should appear below your bio.", of: [defineArrayMember({ type: "bioLink" })] }),
  ],
  preview: { prepare: () => ({ title: "Bio" }) },
});
export const schemaTypes = [seo, imageSlide, videoSlide, project, siteSettings, projectOrder, bioLink, bioPage];
