import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '~/lib/trpc';
import { useAccount } from '@starknet-react/core';

export function useUserPoints() {
  const { address } = useAccount();
  const trpc = useTRPC();

  const { data, isLoading, error, refetch } = useQuery({
    ...trpc.pointsRouter.getUserPoints.queryOptions(
      { userAddress: address || '' },
      { enabled: !!address }
    ),
    staleTime: 30_000, // Cache for 30 seconds
    refetchInterval: 60_000, // Refetch every minute
  });

  return {
    weeklyPoints: data?.weeklyPoints || [],
    totals: data?.totals,
    isLoading,
    error,
    refetch,
  };
}
