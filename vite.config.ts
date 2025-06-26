import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: "ssr" },
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    include: ["@tanstack/react-form", "@tanstack/form-core", "@trpc/server"],
  },
  resolve: {
    alias: {
      punycode: "punycode/",
    },
  },
});

// configPath: "./wrangler.jsonc",
// auxiliaryWorkers: [{ configPath: "../uncap-docs/wrangler.jsonc" }],
// persistState: { path: "../uncap-docs/.wrangler/state" },
