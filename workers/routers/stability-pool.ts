import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { RpcProvider } from "starknet";
import { contractRead } from "~/lib/contracts/calls";
import { CollateralTypeSchema } from "~/lib/contracts/constants";
import { TOKENS } from "~/lib/collateral";
import { bigintToBig } from "~/lib/decimal";
import Big from "big.js";
import {
  fetchPoolPosition,
  calculateStabilityPoolAPR,
} from "workers/services/stability-pool";

const provider = new RpcProvider({
  nodeUrl: process.env.NODE_URL,
});

export const stabilityPoolRouter = router({
  getAllPositions: publicProcedure
    .input(
      z.object({
        userAddress: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { userAddress } = input;

      // Fetch positions for all collateral types in parallel
      // const [ubtcPosition, gbtcPosition, wmwbtcPosition] = await Promise.all([
      //   fetchPoolPosition(provider, userAddress, "UBTC"),
      //   fetchPoolPosition(provider, userAddress, "GBTC"),
      //   fetchPoolPosition(provider, userAddress, "WMWBTC"),
      // ]);

      const wmwbtcPosition = await fetchPoolPosition(
        provider,
        userAddress,
        "WMWBTC"
      );
      return {
        // UBTC: ubtcPosition,
        // GBTC: gbtcPosition,
        WMWBTC: wmwbtcPosition,
      };
    }),
  getTotalDeposits: publicProcedure
    .input(
      z.object({
        collateralType: CollateralTypeSchema,
      })
    )
    .query(async ({ input }) => {
      const { collateralType } = input;

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
        collateralType: CollateralTypeSchema,
      })
    )
    .query(async ({ input }) => {
      const { collateralType } = input;
      return calculateStabilityPoolAPR(provider, collateralType);
    }),
});
