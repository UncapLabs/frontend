import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import babel from "vite-plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { execSync } from "child_process";

// Get git commit hash at build time
function getGitCommitHash(): string {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "unknown";
  }
}

export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(getGitCommitHash()),
  },
  plugins: [
    cloudflare({
      viteEnvironment: { name: "ssr" },
      configPath: "./wrangler.jsonc",
      persistState: { path: "./.wrangler/state" },
    }),
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: ["@babel/preset-typescript"], // if you use TypeScript
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      punycode: "punycode/",
    },
  },
});

// configPath: "./wrangler.jsonc",
// auxiliaryWorkers: [{ configPath: "../uncap-docs/wrangler.jsonc" }],
// persistState: { path: "../uncap-docs/.wrangler/state" },
