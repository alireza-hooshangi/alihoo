import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";
import { isSanityConfigured } from "@/sanity/env";
export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";
export default function StudioPage() {
  if (!isSanityConfigured) return <main style={{ padding: 32, fontFamily: "sans-serif" }}><h1>Connect Alihoo to Sanity</h1><p>Add NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET to .env.local, then restart the development server.</p></main>;
  return <NextStudio config={config} />;
}
