import * as z from "zod";
import { router, publicProcedure } from "../trpc";

export const featureFlagsRouter = router({
  // Get a single feature flag by key
  getFlag: publicProcedure
    .input(
      z.object({
        flag: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const value = await ctx.env.FEATURE_FLAGS.get(input.flag);

        if (value === null) {
          return { flag: input.flag, enabled: false, exists: false };
        }

        // Try to parse as JSON, if it fails treat as string
        let parsedValue: boolean | string;
        try {
          parsedValue = JSON.parse(value);
        } catch {
          parsedValue = value;
        }

        return { flag: input.flag, enabled: parsedValue, exists: true };
      } catch (error) {
        console.error("Error fetching feature flag:", error);
        return {
          flag: input.flag,
          enabled: false,
          exists: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch feature flag",
        };
      }
    }),

  // Get multiple feature flags at once
  getFlags: publicProcedure
    .input(
      z.object({
        flags: z.array(z.string()),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const results = await Promise.all(
          input.flags.map(async (flag) => {
            const value = await ctx.env.FEATURE_FLAGS.get(flag);

            if (value === null) {
              return { flag, enabled: false, exists: false };
            }

            let parsedValue: boolean | string;
            try {
              parsedValue = JSON.parse(value);
            } catch {
              parsedValue = value;
            }

            return { flag, enabled: parsedValue, exists: true };
          })
        );

        return results;
      } catch (error) {
        console.error("Error fetching feature flags:", error);
        throw error;
      }
    }),
});
