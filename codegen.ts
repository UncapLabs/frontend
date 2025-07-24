import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://orca-app-erqua.ondigitalocean.app",
  documents: ["app/lib/graphql/documents.ts"],
  generates: {
    "./app/lib/graphql/gql/": {
      preset: "client",
      plugins: [],
      config: {
        useTypeImports: true,
      },
    },
  },
};

export default config;
