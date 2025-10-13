import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '~/lib/trpc';
import { useAccount } from '@starknet-react/core';

export function useUserRank(seasonNumber?: number) {
  const { address } = useAccount();
  const trpc = useTRPC();

  const { data, isLoading, error } = useQuery({
    ...trpc.pointsRouter.getUserRank.queryOptions(
      {
        userAddress: address || '',
        seasonNumber,
      },
      { enabled: !!address }
    ),
    staleTime: 60_000, // Cache for 1 minute
  });

  return {
    rank: data?.rank || null,
    points: data?.points || 0,
    isLoading,
    error,
  };
}
