import z from "zod";
import { router, publicProcedure } from "../trpc";

// Use the ASSETS binding to fetch static files from the public directory
// The ASSETS binding provides access to files in the public folder

export const contentRouter = router({
  // Generic procedure to fetch any markdown file from the public directory
  getMarkdownContent: publicProcedure
    .input(
      z.object({
        // Allow paths like "terms.md", "privacy-policy.md", or "content/something.md"
        path: z.string().regex(/^[a-zA-Z0-9-_\/]+\.md$/),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // Fetch markdown files from the public directory using ASSETS binding
        const url = new URL(`/${input.path}`, "http://localhost");
        const response = await ctx.env.ASSETS.fetch(url.toString());
        
        if (!response.ok) {
          throw new Error(`File not found: ${response.status}`);
        }
        
        const content = await response.text();
        return { content, error: null };
      } catch (error) {
        console.error(`Error reading ${input.path}:`, error);
        
        // Provide a more helpful fallback based on the requested file
        let fallbackContent = "# Content Not Found\n\nThe requested content could not be loaded.";
        
        if (input.path === "terms.md") {
          fallbackContent = "# Terms & Conditions\n\nTerms content could not be loaded.";
        } else if (input.path === "privacy-policy.md") {
          fallbackContent = "# Privacy Policy\n\nPrivacy policy content could not be loaded.";
        }
        
        return { 
          content: fallbackContent, 
          error: error instanceof Error ? error.message : "Content not found" 
        };
      }
    }),
});
