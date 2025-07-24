import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'http://localhost:3000/graphql',
  documents: ['app/lib/graphql/documents.ts'],
  generates: {
    './app/lib/graphql/gql/': {
      preset: 'client',
      plugins: [],
      config: {
        useTypeImports: true,
      }
    }
  },
}

export default config