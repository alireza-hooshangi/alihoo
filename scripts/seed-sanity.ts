import { createReadStream } from "node:fs";
import { resolve } from "node:path";
import { getCliClient } from "sanity/cli";
import { bio, contact, loaderSlides, projects, type ImageSlide } from "../app/content";

const client = getCliClient({ apiVersion: "2026-11-01" }).withConfig({ useCdn: false });
async function main() {
  const existing = await client.fetch<string[]>('*[_type in ["project", "siteSettings"]]._id');
  if (existing.length) {
    console.log("Content already exists. Seed skipped to preserve your edits.");
    return;
  }
  const assets = new Map<string, string>();
  for (const slide of loaderSlides) {
    const asset = await client.assets.upload("image", createReadStream(resolve(process.cwd(), `public${slide.src}`)), { filename: slide.src.split("/").pop() });
    assets.set(slide.src, asset._id);
  }
  function image(slide: ImageSlide, index: number) {
    return { _type: "imageSlide", _key: `slide-${index}`, alt: slide.alt, asset: { _type: "reference", _ref: assets.get(slide.src) } };
  }
  let transaction = client.transaction().createIfNotExists({
    _id: "siteSettings", _type: "siteSettings", bio: [...bio], email: contact.email, studioUrl: contact.studio,
    loaderImages: loaderSlides.map(image),
  });
  projects.forEach((project, index) => {
    transaction = transaction.createIfNotExists({
      _id: project.id, _type: "project", title: project.name, order: index + 1, paragraphs: [...project.paragraphs],
      slides: project.slides.filter((slide): slide is ImageSlide => slide.type !== "video").map(image),
    });
  });
  await transaction.commit();
  console.log("Imported Site Settings and five placeholder projects into Alihoo.");
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
