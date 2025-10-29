import type { LoaderFunctionArgs } from "react-router";
import * as serverBuild from "virtual:react-router/server-build";

interface SitemapUrl {
  loc: string;
  lastmod?: Date;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
}

const BLOCKED_PATHS = new Set(["/sitemap.xml", "/sitemap-app.xml", "/robots.txt"]);
const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';

export async function loader({ request }: LoaderFunctionArgs) {
  const origin = new URL(request.url).origin;

  try {
    const urls = sitemapUrlsFromServerBuild(origin, serverBuild.routes);
    const xml = `${XML_HEADER}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(toXmlUrlTag).join("\n")}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    throw new Response("", { status: 500 });
  }
}

function sitemapUrlsFromServerBuild(
  origin: string,
  routes: typeof serverBuild.routes
): SitemapUrl[] {
  const urls: SitemapUrl[] = [];
  const seen = new Set<string>();
  const generatedAt = new Date();

  for (const key of Object.keys(routes)) {
    const route = routes[key];
    if (!route) continue;

    const fullPath = buildFullPath(route, routes);
    if (!fullPath) continue;

    if (BLOCKED_PATHS.has(fullPath)) continue;
    if (isDynamic(fullPath)) continue;

    if (seen.has(fullPath)) continue;
    seen.add(fullPath);

    urls.push({
      loc: `${origin}${fullPath}`,
      lastmod: generatedAt,
    });
  }

  return urls.sort((a, b) => a.loc.localeCompare(b.loc));
}

function buildFullPath(
  route: (typeof serverBuild.routes)[string],
  routes: typeof serverBuild.routes
): string | null {
  const segments: string[] = [];
  let current: (typeof serverBuild.routes)[string] | undefined = route;

  while (current) {
    if (!current.index && typeof current.path === "string" && current.path.length > 0) {
      segments.unshift(current.path);
      if (current.path.startsWith("/")) break;
    }

    current = current.parentId ? routes[current.parentId] : undefined;
  }

  if (segments.length === 0) {
    return "/";
  }

  const joined = segments.join("/");
  const prefixed = joined.startsWith("/") ? joined : `/${joined}`;
  const normalized = prefixed.replace(/\/+/g, "/");

  return normalized.length === 0 ? "/" : normalized;
}

function isDynamic(path: string): boolean {
  return path.includes(":") || path.includes("*");
}

function toXmlUrlTag(url: SitemapUrl): string {
  const parts = [`  <url>`, `    <loc>${escapeXml(url.loc)}</loc>`];

  if (url.lastmod) {
    parts.push(`    <lastmod>${url.lastmod.toISOString()}</lastmod>`);
  }
  if (url.changefreq) {
    parts.push(`    <changefreq>${url.changefreq}</changefreq>`);
  }
  if (typeof url.priority === "number") {
    parts.push(`    <priority>${url.priority.toFixed(1)}</priority>`);
  }

  parts.push("  </url>");

  return parts.join("\n");
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
