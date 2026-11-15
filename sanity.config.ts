"use client";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

const singletons = new Set(["siteSettings", "projectOrder", "bioPage"]);

export default defineConfig({
  name: "alihoo", title: "Alihoo", basePath: "/studio",
  projectId: projectId || "unconfigured", dataset,
  plugins: [structureTool({ structure: (S) => S.list().title("Alihoo content").items([
    S.documentTypeListItem("project").title("Projects"),
    S.listItem().title("Project order").child(S.document().schemaType("projectOrder").documentId("projectOrder")),
    S.listItem().title("Bio").child(S.document().schemaType("bioPage").documentId("bio")),
    S.listItem().title("Site Settings").child(S.document().schemaType("siteSettings").documentId("siteSettings")),
  ]) })],
  schema: { types: schemaTypes, templates: (templates) => templates.filter((template) => !singletons.has(template.schemaType)) },
  document: { actions: (actions, context) => singletons.has(context.schemaType) ? actions.filter(({ action }) => action !== "delete" && action !== "duplicate") : actions },
});
