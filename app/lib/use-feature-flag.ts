import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "./trpc";

/**
 * Hook to fetch a single feature flag value from Cloudflare KV
 * @param flag - The feature flag key to fetch
 * @returns The feature flag data including enabled status
 */
export function useFeatureFlag(flag: string) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.featureFlagsRouter.getFlag.queryOptions(
      { flag },
      {
        // Cache for 1 minute to avoid excessive KV reads
        staleTime: 60 * 1000,
        // Keep the data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
      }
    ),
  });
}
