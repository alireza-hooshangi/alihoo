import { getCliClient } from "sanity/cli";
const client = getCliClient({ apiVersion: "2026-11-01" }).withConfig({ useCdn: false, perspective: "raw" });
async function main() {
  const documents = await client.fetch<{ _id: string }[]>('*[_type == "project" && !defined(slug.current)]{_id}');
  let transaction = client.transaction();
  for (const document of documents) {
    transaction = transaction.patch(document._id, patch => patch.setIfMissing({ slug: { _type: "slug", current: document._id.replace(/^drafts\./, "") } }));
  }
  for (const id of ["siteSettings", "drafts.siteSettings"]) {
    if (await client.getDocument(id)) transaction = transaction.patch(id, patch => patch.setIfMissing({ siteName: "Alihoo", siteUrl: "https://alihoo-chi.vercel.app" }));
  }
  await transaction.commit();
  console.log(`Initialized SEO defaults and ${documents.length} missing project URLs; existing values preserved.`);
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
