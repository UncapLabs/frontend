import { GraphQLClient } from 'graphql-request';

// Create a function to get the GraphQL endpoint based on environment
export function getGraphQLEndpoint() {
  // In browser, use Vite env vars
  if (typeof window !== 'undefined' && import.meta.env?.VITE_GRAPHQL_ENDPOINT) {
    return import.meta.env.VITE_GRAPHQL_ENDPOINT;
  }
  // Default fallback
  return 'http://localhost:3000/graphql';
}

// Create GraphQL client instance
export const graphqlClient = new GraphQLClient(getGraphQLEndpoint(), {
  headers: {
    // Add any default headers here if needed
  },
});

// Export a function to create a client with custom endpoint
export function createGraphQLClient(endpoint?: string) {
  return new GraphQLClient(endpoint || getGraphQLEndpoint(), {
    headers: {
      // Add any default headers here if needed
    },
  });
}