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
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 1, description: "Lower numbers appear first.", validation: (rule) => rule.required().integer().min(0) }),
    defineField({ name: "cover", title: "Cover image", type: "imageSlide", description: "Project thumbnail. This can be different from the carousel images.", validation: (rule) => rule.required() }),
    paragraphs,
    defineField({ name: "slides", type: "array", description: "Drag to reorder. Images and videos can be mixed in the same carousel.", of: [defineArrayMember({ type: "imageSlide" }), defineArrayMember({ type: "videoSlide" })], validation: (rule) => rule.required().min(1) }),
  ],
  orderings: [{ title: "Display order", name: "displayOrder", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", order: "order", media: "cover" }, prepare: ({ title, order, media }) => ({ title, media, subtitle: `Order: ${order ?? "unset"}` }) },
});
export const siteSettings = defineType({
  name: "siteSettings", title: "Site Settings", type: "document",
  fields: [
    defineField({ ...paragraphs, name: "bio", title: "Homepage bio" }),
    defineField({ name: "email", title: "Contact email", type: "string", validation: (rule) => rule.required().email() }),
    defineField({ name: "studioUrl", title: "Hooman Studio link", type: "url", validation: (rule) => rule.required().uri({ scheme: ["https", "http"] }) }),
    defineField({ name: "loaderImages", title: "Homepage loader images", type: "array", description: "Drag to set the frame sequence. The sequence repeats every five seconds.", of: [defineArrayMember({ type: "imageSlide" })], validation: (rule) => rule.required().min(1).max(20) }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
export const schemaTypes = [imageSlide, videoSlide, project, siteSettings];
