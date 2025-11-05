import { GraphQLClient } from "graphql-request";

// Export a function to create a client with custom endpoint
export function createGraphQLClient(endpoint?: string) {
  return new GraphQLClient(endpoint || "", {
    headers: {
      // Add any default headers here if needed
    },
  });
}
