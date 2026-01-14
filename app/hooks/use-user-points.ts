import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '~/lib/trpc';
import { useAccount } from '@starknet-react/core';

export function useUserPoints(seasonNumber?: number) {
  const { address } = useAccount();
  const trpc = useTRPC();

  const { data, isLoading, error, refetch } = useQuery({
    ...trpc.pointsRouter.getUserPoints.queryOptions(
      { userAddress: address || '', seasonNumber },
      { enabled: !!address }
    ),
    staleTime: 30_000, // Cache for 30 seconds
    refetchInterval: 60_000, // Refetch every minute
  });

  return {
    weeklyPoints: data?.weeklyPoints || [],
    totals: data?.totals,
    lastWeekPoints: data?.lastWeekPoints ?? null,
    isLoading,
    error,
    refetch,
  };
}
