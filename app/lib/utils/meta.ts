import type { MetaDescriptor } from "react-router";

type PageMeta = {
  title: string;
  description: string;
};

/**
 * Helper to merge route meta with parent meta (preserves OG images, etc from root)
 * Only overrides title and description tags
 */
export function createMeta(
  { matches }: { matches: Array<{ meta?: MetaDescriptor[] } | undefined> },
  pageMeta: PageMeta
): MetaDescriptor[] {
  const parentMeta = matches
    .filter((match) => match !== undefined)
    .flatMap((match) => match.meta ?? []);

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

  // Deduplicate preserved meta (e.g., twitter:image appears in multiple parent routes)
  const uniquePreserved = Array.from(
    new Map(
      preservedMeta.map((meta) => {
        const key =
          "name" in meta && meta.name ? `name:${meta.name}` :
          "property" in meta && meta.property ? `property:${meta.property}` :
          "charset" in meta ? "charset" :
          JSON.stringify(meta);
        return [key, meta];
      })
    ).values()
  );

  return [
    ...uniquePreserved,
    { title: pageMeta.title },
    { name: "description", content: pageMeta.description },
    { property: "og:title", content: pageMeta.title },
    { property: "og:description", content: pageMeta.description },
    { name: "twitter:title", content: pageMeta.title },
    { name: "twitter:description", content: pageMeta.description },
  ];
}
