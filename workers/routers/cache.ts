import * as z from "zod";
import { router, publicProcedure } from "../trpc";

/**
 * Cache management router
 * Provides utilities for invalidating server-side KV cache
 */
export const cacheRouter = router({
  /**
   * Clear specific cache keys
   */
  clearKeys: publicProcedure
    .input(
      z.object({
        keys: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { keys } = input;

      // Delete all specified cache keys in parallel
      await Promise.all(keys.map((key) => ctx.env.CACHE.delete(key)));

      return { success: true, clearedKeys: keys };
    }),
});

export type CacheRouter = typeof cacheRouter;
