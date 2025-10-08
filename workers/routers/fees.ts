import { publicProcedure, router } from "../trpc";
import * as z from "zod";
import { RpcProvider } from "starknet";
import { contractRead } from "~/lib/contracts/calls";
import { CollateralTypeSchema } from "~/lib/contracts/constants";
import { type CollateralId } from "~/lib/collateral";
import { bigintToBig } from "~/lib/decimal";

export const feesRouter = router({
  predictOpenTroveUpfrontFee: publicProcedure
    .input(
      z.object({
        collateralType: CollateralTypeSchema,
        borrowedAmount: z.string(), // BigInt as string for JSON serialization
        interestRate: z.string(), // BigInt as string for JSON serialization
      })
    )
    .query(async ({ input, ctx }) => {
      const provider = new RpcProvider({ nodeUrl: ctx.env.NODE_URL });

      try {
        // Convert string inputs back to bigints
        const borrowedAmount = BigInt(input.borrowedAmount);
        const interestRate = BigInt(input.interestRate);

        // Call the contract to get the upfront fee
        const upfrontFee =
          await contractRead.hintHelpers.predictOpenTroveUpfrontFee(
            provider,
            input.collateralType as CollateralId,
            borrowedAmount,
            interestRate
          );

        return {
          upfrontFee: bigintToBig(upfrontFee, 18),
        };
      } catch (error) {
        console.error("Error predicting open trove upfront fee:", error);
        throw new Error("Failed to predict upfront fee");
      }
    }),

  predictAdjustTroveUpfrontFee: publicProcedure
    .input(
      z.object({
        collateralType: CollateralTypeSchema,
        troveId: z.string(), // BigInt as string for JSON serialization
        debtIncrease: z.string(), // BigInt as string for JSON serialization
      })
    )
    .query(async ({ input, ctx }) => {
      const provider = new RpcProvider({ nodeUrl: ctx.env.NODE_URL });

      try {
        // Convert string inputs back to bigints
        const troveId = BigInt(input.troveId);
        const debtIncrease = BigInt(input.debtIncrease);

        // Call the contract to get the upfront fee
        const upfrontFee =
          await contractRead.hintHelpers.predictAdjustTroveUpfrontFee(
            provider,
            input.collateralType as CollateralId,
            troveId,
            debtIncrease
          );

        // Return the fee as Big instance for precision
        return {
          upfrontFee: bigintToBig(upfrontFee, 18),
        };
      } catch (error) {
        console.error("Error predicting adjust trove upfront fee:", error);
        throw new Error("Failed to predict upfront fee");
      }
    }),
});

export type FeesRouter = typeof feesRouter;
