import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '~/lib/trpc';
import { useState } from 'react';

export function useLeaderboard(seasonNumber?: number) {
  const trpc = useTRPC();
  const [page, setPage] = useState(0);
  const limit = 50;

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
    page,
    setPage,
    isLoading,
    error,
  };
}
