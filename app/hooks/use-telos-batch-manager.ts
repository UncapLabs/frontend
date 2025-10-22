import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";

interface UseTelosBatchMetadataOptions {
  branchId?: number;
  batchManagerAddress?: string;
  enabled?: boolean;
  refetchIntervalMs?: number;
}

export function useTelosBatchMetadata(
  options: UseTelosBatchMetadataOptions = {}
) {
  const trpc = useTRPC();
  const {
    branchId = 0,
    batchManagerAddress,
    enabled = true,
    refetchIntervalMs = 30_000,
  } = options;

  return useQuery({
    ...trpc.interestRouter.getTelosBatchMetadata.queryOptions({
      branchId,
      batchManagerAddress,
    }),
    staleTime: refetchIntervalMs,
    refetchInterval: refetchIntervalMs,
    enabled,
  });
}
