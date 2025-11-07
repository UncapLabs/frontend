import * as z from "zod";
import { router, publicProcedure } from "../trpc";
import { RpcProvider } from "starknet";
import { contractRead } from "~/lib/contracts/calls";
import { CollateralIdSchema, TOKENS, COLLATERAL_LIST, type CollateralId } from "~/lib/collateral";
import { bigintToBig } from "~/lib/decimal";
import Big from "big.js";
import {
  fetchPoolPosition,
  calculateStabilityPoolAPR,
} from "workers/services/stability-pool";

export const stabilityPoolRouter = router({
  getAllPositions: publicProcedure
    .input(
      z.object({
        userAddress: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { userAddress } = input;
      const provider = new RpcProvider({ nodeUrl: ctx.env.NODE_URL });

      // Fetch positions for all collateral types in parallel
      const positions = await Promise.all(
        COLLATERAL_LIST.map((collateral) =>
          fetchPoolPosition(provider, userAddress, collateral.id)
        )
      );

      // Build result object dynamically
      const result = {} as Record<CollateralId, typeof positions[0]>;
      COLLATERAL_LIST.forEach((collateral, index) => {
        result[collateral.id] = positions[index];
      });

      return result;
    }),
  getTotalDeposits: publicProcedure
    .input(
      z.object({
        collateralType: CollateralIdSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      const { collateralType } = input;
      const provider = new RpcProvider({ nodeUrl: ctx.env.NODE_URL });

      try {
        const totalDeposits = await contractRead.stabilityPool.getTotalDeposits(
          provider,
          collateralType
        );
        // Return Big instance to preserve precision
        return bigintToBig(totalDeposits, TOKENS.USDU.decimals);
      } catch (error) {
        console.error(
          `Error fetching total deposits for ${collateralType}:`,
          error
        );
        return new Big(0);
      }
    }),
  getPoolApr: publicProcedure
    .input(
      z.object({
        collateralType: CollateralIdSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      const { collateralType } = input;
      const provider = new RpcProvider({ nodeUrl: ctx.env.NODE_URL });
      return calculateStabilityPoolAPR(provider, collateralType);
    }),
});
