"use client";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

export default defineConfig({
  name: "alihoo", title: "Alihoo", basePath: "/studio",
  projectId: projectId || "unconfigured", dataset,
  plugins: [structureTool({ structure: (S) => S.list().title("Alihoo content").items([
    S.listItem().title("Site Settings").child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    S.documentTypeListItem("project").title("Projects"),
  ]) })],
  schema: { types: schemaTypes, templates: (templates) => templates.filter((template) => template.schemaType !== "siteSettings") },
  document: { actions: (actions, context) => context.schemaType === "siteSettings" ? actions.filter(({ action }) => action !== "delete" && action !== "duplicate") : actions },
});
