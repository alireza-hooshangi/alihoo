import { getCliClient } from "sanity/cli";
import { bio, contact } from "../app/content";
const client = getCliClient({ apiVersion: "2026-11-01" }).withConfig({ useCdn: false, perspective: "raw" });
type Settings = { _id: string; bio?: string[]; email?: string; studioUrl?: string };
async function main() {
  const result = await client.fetch<{ settings: Settings[]; projects: { _id: string }[] }>(
    '{"settings":*[_id in ["siteSettings","drafts.siteSettings"]]{_id,bio,email,studioUrl},"projects":*[_type == "project" && !(_id in path("drafts.**"))] | order(order asc, _createdAt asc){_id}}',
  );
  const published = result.settings.find((document) => document._id === "siteSettings");
  const draft = result.settings.find((document) => document._id === "drafts.siteSettings");
  function profile(id: string, settings?: Settings) {
    return { _id: id, _type: "bioPage", paragraphs: settings?.bio ?? [...bio], links: [
      { _type: "bioLink", _key: "studio", label: "Hooman Studio", caption: "Real Work", href: settings?.studioUrl ?? contact.studio, newTab: true },
      { _type: "bioLink", _key: "email", label: "Email", caption: "Say hello", href: `mailto:${settings?.email ?? contact.email}`, newTab: false },
    ] };
  }
  let transaction = client.transaction()
    .createIfNotExists(profile("bio", published))
    .createIfNotExists({ _id: "projectOrder", _type: "projectOrder", projects: result.projects.map(({ _id }, index) => ({ _type: "reference", _key: `project-${index}`, _ref: _id, _weak: true })) });
  if (draft) transaction = transaction.createIfNotExists(profile("drafts.bio", draft));
  await transaction.commit();
  console.log("Bio and Project order initialized. Existing documents, drafts, and legacy fields preserved.");
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
