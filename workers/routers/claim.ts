import { publicProcedure, router } from "../trpc";
import * as z from "zod";
import {
  getAllocationAmount,
  getClaimCalldata,
  getRoot,
  getRoundBreakdown,
} from "../services/claim";
import { bigintToBig } from "~/lib/decimal";
import { RpcProvider } from "starknet";
import { contractRead } from "~/lib/contracts/calls";
import Big from "big.js";

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
    .query(async ({ input, ctx }) => {
      const response = await getRoundBreakdown(ctx.env, input);
      const toBig = (value: string) => {
        try {
          return bigintToBig(BigInt(value), 18);
        } catch {
          return new Big(value);
        }
      };

      return {
        address: input.address,
        rounds: response.rounds.map((round) => ({
          round: round.round,
          amount: toBig(round.amount),
          cumulative: toBig(round.cumulative),
        })),
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
