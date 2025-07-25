import { z } from "zod/v4";
import { publicProcedure, router } from "../trpc";
import { RpcProvider } from "starknet";
import { createGraphQLClient } from "~/lib/graphql/client";
import {
  fetchLoansByAccount,
  getNextOwnerIndex,
} from "../services/trove-service";

export const positionsRouter = router({
  getUserOnChainPositions: publicProcedure
    .input(
      z.object({
        userAddress: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { userAddress } = input;

      if (!process.env.NODE_URL) {
        throw new Error("RPC node URL not configured");
      }

      const provider = new RpcProvider({
        nodeUrl: process.env.NODE_URL,
      });

      try {
        // Setup GraphQL client
        const graphqlEndpoint =
          process.env.GRAPHQL_ENDPOINT || "http://localhost:3000/graphql";
        const graphqlClient = createGraphQLClient(graphqlEndpoint);

        const positions = await fetchLoansByAccount(
          provider,
          graphqlClient,
          userAddress
        );

        return { positions };
      } catch (error) {
        console.error("Error fetching user positions:", error);
        throw new Error("Failed to fetch on-chain positions");
      }
    }),

  getNextOwnerIndex: publicProcedure
    .input(
      z.object({
        borrower: z.string(),
        collateralType: z.enum(["UBTC", "GBTC"]),
      })
    )
    .query(async ({ input }) => {
      const { borrower, collateralType } = input;

      try {
        const graphqlEndpoint =
          process.env.GRAPHQL_ENDPOINT || "http://localhost:3000/graphql";
        const graphqlClient = createGraphQLClient(graphqlEndpoint);

        const nextOwnerIndex = await getNextOwnerIndex(
          graphqlClient,
          borrower,
          collateralType
        );

        return { nextOwnerIndex };
      } catch (error) {
        console.error("Error fetching next owner index:", error);
        throw new Error("Failed to fetch next owner index");
      }
    }),
});

export type PositionsRouter = typeof positionsRouter;
