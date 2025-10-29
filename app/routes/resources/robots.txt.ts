import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const origin = new URL(request.url).origin;

  const robots = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${origin}/sitemap.xml`,
    `Sitemap: ${origin}/sitemap-app.xml`,
    `Sitemap: ${origin}/resources/sitemap.xml`,
  ].join("\n");

  return new Response(robots, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
