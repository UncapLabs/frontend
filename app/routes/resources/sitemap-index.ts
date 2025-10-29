import type { LoaderFunctionArgs } from "react-router";

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';

interface SitemapEntry {
  loc: string;
  lastmod?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const origin = new URL(request.url).origin;
  const generatedAt = new Date().toISOString();

  try {
    const sitemaps: SitemapEntry[] = [
      { loc: `${origin}/sitemap-app.xml`, lastmod: generatedAt },
      { loc: `${origin}/resources/sitemap.xml` },
    ];

    const xml = `${XML_HEADER}
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(toXmlSitemapTag).join("\n")}
</sitemapindex>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap index:", error);
    throw new Response("", { status: 500 });
  }
}

function toXmlSitemapTag(entry: SitemapEntry): string {
  const lines = [`  <sitemap>`, `    <loc>${escapeXml(entry.loc)}</loc>`];

  if (entry.lastmod) {
    lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
  }

  lines.push("  </sitemap>");

  return lines.join("\n");
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
