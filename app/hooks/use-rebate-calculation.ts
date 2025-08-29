import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";

interface UseRebateCalculationParams {
  borrowAmount?: number;
  interestRate: number;
  enabled?: boolean;
}

export function useRebateCalculation({
  borrowAmount,
  interestRate,
  enabled = true,
}: UseRebateCalculationParams) {
  const trpc = useTRPC();

  const query = useQuery({
    ...trpc.rebateRouter.calculateRebate.queryOptions({
      borrowAmount: borrowAmount || 0,
      interestRate,
    }),
    enabled: enabled && !!borrowAmount && borrowAmount > 0,
    // Keep previous data while fetching to prevent flashing
    placeholderData: (previousData) => previousData,
    // Stale time to prevent refetching too often
    staleTime: 100,
  });

  return {
    rebateData: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
}