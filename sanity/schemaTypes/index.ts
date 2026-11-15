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
export const project = defineType({
  name: "project", title: "Project", type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
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
    defineField({ ...paragraphs, name: "bio", title: "Legacy bio", hidden: true, readOnly: true, validation: undefined }),
    defineField({ name: "email", title: "Legacy email", type: "string", hidden: true, readOnly: true }),
    defineField({ name: "studioUrl", title: "Legacy studio link", type: "url", hidden: true, readOnly: true }),
    defineField({ name: "loaderImages", title: "Homepage loader images", type: "array", description: "Drag to set the frame sequence. The sequence repeats every five seconds.", of: [defineArrayMember({ type: "imageSlide" })], validation: (rule) => rule.required().min(1).max(20) }),
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
export const schemaTypes = [imageSlide, videoSlide, project, siteSettings, projectOrder, bioLink, bioPage];
