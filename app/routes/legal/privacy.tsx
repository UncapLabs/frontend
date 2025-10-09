import type { Route } from "./+types/privacy";
import ReactMarkdown from "react-markdown";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { createCaller } from "../../../workers/router";
import { RpcProvider } from "starknet";

// Server-side loader for SSR
export async function loader({ context }: Route.LoaderArgs) {
  const caller = createCaller({
    env: context.cloudflare.env,
    executionCtx: context.cloudflare.ctx,
  });

  try {
    const data = await caller.contentRouter.getMarkdownContent({
      path: "privacy-policy.md",
    });
    return { content: data.content, error: data.error };
  } catch (error) {
    console.error("Error loading privacy policy:", error);
    return {
      content:
        "# Privacy Policy\n\nPrivacy policy content could not be loaded.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default function Privacy({ loaderData }: Route.ComponentProps) {
  const { content, error } = loaderData;

  return (
    <div className="min-h-screen bg-[#f5f3ee]">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-[#004BB2] font-sora">
            Privacy Policy
          </h1>
          <Link to="/">
            <Button
              variant="outline"
              className="text-[#004BB2] border-[#004BB2] hover:bg-[#004BB2] hover:text-white"
            >
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {error ? (
          <div className="text-red-600 text-center py-8">
            Error loading privacy policy: {error}
          </div>
        ) : (
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-[#004BB2] mt-8 mb-4 font-sora">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold text-[#004BB2] mt-6 mb-3 font-sora">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-medium text-[#004BB2] mt-4 mb-2 font-sora">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc space-y-2 mb-4 text-gray-700 ml-6">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal space-y-2 mb-4 text-gray-700 ml-6">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-[#004BB2]">
                    {children}
                  </strong>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-[#004BB2] underline hover:text-[#003680] transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                em: ({ children }) => (
                  <em className="italic text-gray-600">{children}</em>
                ),
              }}
            >
              {content || ""}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
