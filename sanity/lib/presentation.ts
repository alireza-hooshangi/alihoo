export function orderProjects<T extends { _id: string }>(projects: T[], references: { _ref: string }[] = []): T[] {
  const remaining = new Map(projects.map((project) => [project._id, project]));
  const ordered: T[] = [];
  for (const { _ref } of references) {
    const project = remaining.get(_ref);
    if (project) { ordered.push(project); remaining.delete(_ref); }
  }
  return [...ordered, ...remaining.values()];
}

export function isSafeBioHref(href: unknown): href is string {
  if (typeof href !== "string") return false;
  try { return ["https:", "http:", "mailto:", "tel:"].includes(new URL(href).protocol); }
  catch { return false; }
}
