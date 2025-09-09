import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { RpcProvider } from "starknet";
import { contractRead } from "~/lib/contracts/calls";
import { USDU_TOKEN } from "~/lib/contracts/constants";
import { bigintToDecimal } from "~/lib/decimal";
import { fetchPoolPosition, calculateStabilityPoolAPR } from "workers/services/stability-pool";

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
      const [ubtcPosition, gbtcPosition] = await Promise.all([
        fetchPoolPosition(provider, userAddress, "UBTC"),
        fetchPoolPosition(provider, userAddress, "GBTC"),
      ]);

      return {
        UBTC: ubtcPosition,
        GBTC: gbtcPosition,
      };
    }),
  getTotalDeposits: publicProcedure
    .input(
      z.object({
        collateralType: z.enum(["UBTC", "GBTC"]),
      })
    )
    .query(async ({ input }) => {
      const { collateralType } = input;

      try {
        const totalDeposits = await contractRead.stabilityPool.getTotalDeposits(
          provider,
          collateralType
        );
        return bigintToDecimal(totalDeposits, USDU_TOKEN.decimals);
      } catch (error) {
        console.error(
          `Error fetching total deposits for ${collateralType}:`,
          error
        );
        return 0;
      }
    }),
  getPoolApr: publicProcedure
    .input(
      z.object({
        collateralType: z.enum(["UBTC", "GBTC"]),
      })
    )
    .query(async ({ input }) => {
      const { collateralType } = input;
      return calculateStabilityPoolAPR(provider, collateralType);
    }),
});
