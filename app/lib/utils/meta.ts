import type { MetaDescriptor } from "react-router";

type MetaArgs = {
  matches: Array<{ meta?: MetaDescriptor[] }>;
};

type PageMeta = {
  title: string;
  description: string;
};

/**
 * Helper to merge route meta with parent meta (preserves OG images, etc from root)
 * Only overrides title and description tags
 */
export function createMeta(
  { matches }: MetaArgs,
  pageMeta: PageMeta
): MetaDescriptor[] {
  const parentMeta = matches.flatMap((match) => match.meta ?? []);

  // Filter out tags we want to override
  const preservedMeta = parentMeta.filter(
    (meta) =>
      !("title" in meta) &&
      !("name" in meta && meta.name === "description") &&
      !("property" in meta && meta.property === "og:title") &&
      !("property" in meta && meta.property === "og:description") &&
      !("name" in meta && meta.name === "twitter:title") &&
      !("name" in meta && meta.name === "twitter:description")
  );

  return [
    ...preservedMeta,
    { title: pageMeta.title },
    { name: "description", content: pageMeta.description },
    { property: "og:title", content: pageMeta.title },
    { property: "og:description", content: pageMeta.description },
    { name: "twitter:title", content: pageMeta.title },
    { name: "twitter:description", content: pageMeta.description },
  ];
}
