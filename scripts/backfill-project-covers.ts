import { getCliClient } from "sanity/cli";
const client = getCliClient({ apiVersion: "2026-11-01" }).withConfig({ useCdn: false, perspective: "raw" });
async function main() {
  const projects = await client.fetch<{ _id: string; image: { _type: string; alt: string; asset: { _type: string; _ref: string } } | null }[]>(
    '*[_type == "project" && !defined(cover)]{_id,"image":slides[_type == "imageSlide" && defined(asset._ref)][0]{_type,alt,asset}}',
  );
  const eligible = projects.filter((project) => project.image);
  if (!eligible.length) { console.log("No missing covers to fill."); return; }
  let transaction = client.transaction();
  for (const project of eligible) transaction = transaction.patch(project._id, (patch) => patch.setIfMissing({ cover: project.image }));
  await transaction.commit();
  console.log(`Added covers to ${eligible.length} projects. Existing covers preserved.`);
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
