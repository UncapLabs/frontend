import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '~/lib/trpc';

export function useLeaderboard(seasonNumber?: number, page: number = 0, limit: number = 50) {
  const trpc = useTRPC();

  const { data, isLoading, error } = useQuery({
    ...trpc.pointsRouter.getLeaderboard.queryOptions({
      seasonNumber,
      limit,
      offset: page * limit,
    }),
    staleTime: 60_000, // Cache for 1 minute
    placeholderData: (previousData) => previousData, // Keep previous page while loading next
  });

  return {
    leaderboard: data?.leaderboard || [],
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    error,
  };
}
