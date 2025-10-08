import * as z from "zod";
import { publicProcedure, router } from "../trpc";
import { RpcProvider } from "starknet";
import { createGraphQLClient } from "~/lib/graphql/client";
import {
  fetchPositionById,
  getNextOwnerIndex,
  getCollateralSurplus,
} from "../services/trove-service";
import { fetchLoansByAccount } from "../services/trove-service";

export const positionsRouter = router({
  getUserOnChainPositions: publicProcedure
    .input(
      z.object({
        userAddress: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { userAddress } = input;

      const provider = new RpcProvider({ nodeUrl: ctx.env.NODE_URL });

      try {
        // Setup GraphQL client
        const graphqlEndpoint = ctx.env.GRAPHQL_ENDPOINT;
        const graphqlClient = createGraphQLClient(graphqlEndpoint);

        const { positions, errors } = await fetchLoansByAccount(
          provider,
          graphqlClient,
          userAddress
        );

        // Log any errors but still return valid positions
        if (errors.length > 0) {
          console.warn(
            `[getUserOnChainPositions] Encountered ${errors.length} errors:`,
            errors
          );
        }

        return { positions, errors };
      } catch (error) {
        console.error("Error fetching user positions:", error);
        throw new Error("Failed to fetch on-chain positions");
      }
    }),
  getNextOwnerIndex: publicProcedure
    .input(
      z.object({
        borrower: z.string(),
        collateralType: z.enum(["WWBTC"]), // "UBTC", "GBTC"
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
        console.error("Error fetching next owner index - full error:", error);
        console.error(
          "Error stack:",
          error instanceof Error ? error.stack : "No stack"
        );
        throw new Error("Failed to fetch next owner index");
      }
    }),
  getPositionById: publicProcedure
    .input(
      z.object({
        troveId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { troveId } = input;

      const provider = new RpcProvider({ nodeUrl: ctx.env.NODE_URL });

      try {
        const graphqlEndpoint = ctx.env.GRAPHQL_ENDPOINT;
        const graphqlClient = createGraphQLClient(graphqlEndpoint);

        const position = await fetchPositionById(
          provider,
          graphqlClient,
          troveId
        );

        return { position };
      } catch (error) {
        console.error("Error fetching position by ID:", error);
        throw new Error("Failed to fetch position");
      }
    }),

  getCollateralSurplus: publicProcedure
    .input(
      z.object({
        borrower: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { borrower } = input;

      const provider = new RpcProvider({ nodeUrl: ctx.env.NODE_URL });

      try {
        const surplus = await getCollateralSurplus(provider, borrower);
        return surplus;
      } catch (error) {
        console.error("Error fetching collateral surplus:", error);
        throw new Error("Failed to fetch collateral surplus");
      }
    }),
});

export type PositionsRouter = typeof positionsRouter;
