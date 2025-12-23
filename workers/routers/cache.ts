import * as z from "zod";
import { router, publicProcedure } from "../trpc";

/**
 * Get network-prefixed cache key to prevent staging/production data mixing
 */
function getCacheKey(base: string): string {
  const network = process.env.NETWORK || "sepolia";
  return `${network}:${base}`;
}

/**
 * Cache management router
 * Provides utilities for invalidating server-side KV cache
 */
export const cacheRouter = router({
  /**
   * Clear specific cache keys
   * Note: Keys are automatically prefixed with the network (mainnet/sepolia)
   */
  clearKeys: publicProcedure
    .input(
      z.object({
        keys: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { keys } = input;

      // Add network prefix to keys before deleting
      const prefixedKeys = keys.map((key) => getCacheKey(key));

      // Delete all specified cache keys in parallel
      await Promise.all(prefixedKeys.map((key) => ctx.env.CACHE.delete(key)));

      return { success: true, clearedKeys: prefixedKeys };
    }),
});

export type CacheRouter = typeof cacheRouter;
