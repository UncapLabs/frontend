import { publicProcedure, router } from "../trpc";
import * as z from "zod";
import {
  getAllocationAmount,
  getClaimCalldata,
  getRoot,
} from "../services/claim";
import { bigintToBig } from "~/lib/decimal";
import { RpcProvider } from "starknet";
import { contractRead } from "~/lib/contracts/calls";

const addressSchema = z
  .string()
  .min(1, "Address is required")
  .regex(/^0x[a-fA-F0-9]+$/, "Address must be a 0x-prefixed hex string");

const roundSchema = z
  .number()
  .int()
  .min(0, "Round must be non-negative")
  .max(255, "Round exceeds supported range")
  .optional();

export const claimRouter = router({
  getCalldata: publicProcedure
    .input(
      z.object({
        address: addressSchema,
        round: roundSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      return getClaimCalldata(ctx.env, input);
    }),

  getAllocationAmount: publicProcedure
    .input(
      z.object({
        address: addressSchema,
        round: roundSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      const amountString = await getAllocationAmount(ctx.env, input);
      // Convert string to Big for consistent type system
      return bigintToBig(BigInt(amountString), 18); // STRK has 18 decimals
    }),

  getRoot: publicProcedure
    .input(
      z.object({
        round: roundSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      return getRoot(ctx.env, input);
    }),

  getRoundBreakdown: publicProcedure
    .input(
      z.object({
        address: addressSchema,
        round: roundSchema,
      })
    )
    .query(async ({ input }) => {
      // TODO: Replace with getRoundBreakdown(ctx.env, input) once API endpoint is available
      // Hardcoded data for 10 weeks starting Nov 5, 2025
      return {
        address: input.address,
        rounds: [
          { round: 1, amount: bigintToBig(BigInt("125750000000000000000"), 18) },
          { round: 2, amount: bigintToBig(BigInt("148320000000000000000"), 18) },
          { round: 3, amount: bigintToBig(BigInt("165400000000000000000"), 18) },
          { round: 4, amount: bigintToBig(BigInt("189250000000000000000"), 18) },
          { round: 5, amount: bigintToBig(BigInt("195500000000000000000"), 18) },
          { round: 6, amount: bigintToBig(BigInt("210000000000000000000"), 18) },
          { round: 7, amount: bigintToBig(BigInt("198750000000000000000"), 18) },
          { round: 8, amount: bigintToBig(BigInt("225300000000000000000"), 18) },
          { round: 9, amount: bigintToBig(BigInt("240000000000000000000"), 18) },
          { round: 10, amount: bigintToBig(BigInt("258500000000000000000"), 18) },
        ],
      };
    }),

  getAmountAlreadyClaimed: publicProcedure
    .input(
      z.object({
        address: addressSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      const provider = new RpcProvider({ nodeUrl: ctx.env.NODE_URL });
      const alreadyClaimed = await contractRead.claimDistributor.amountAlreadyClaimed(
        provider,
        input.address
      );
      // Convert bigint to Big for consistent type system
      return bigintToBig(alreadyClaimed, 18); // STRK has 18 decimals
    }),
});

export type ClaimRouter = typeof claimRouter;
