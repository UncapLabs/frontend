import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";

export const LEADERBOARD_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 500;

export function useLeaderboard(
  seasonNumber?: number,
  page?: number,
  limit?: number
) {
  const trpc = useTRPC();

  const normalizedSeason =
    typeof seasonNumber === "number" && Number.isFinite(seasonNumber)
      ? seasonNumber
      : undefined;

  const safeLimit = Math.min(
    Math.max(Math.floor(limit ?? LEADERBOARD_PAGE_SIZE), 1),
    MAX_PAGE_SIZE
  );
  const safePage = Math.max(0, Math.floor(page ?? 0));
  const offset = safePage * safeLimit;

  const queryResult = useQuery({
    ...trpc.pointsRouter.getLeaderboard.queryOptions(
      {
        seasonNumber: normalizedSeason,
        limit: safeLimit,
        offset,
      },
      {
        staleTime: 60_000,
        placeholderData: (previous) => previous,
      }
    ),
  });

  const data = queryResult.data;
  const total = data?.total ?? 0;
  const pageCount =
    data?.pageCount ?? (total > 0 ? Math.ceil(total / safeLimit) : 0);
  const serverHasMore = data?.hasMore ?? false;
  const hasMore =
    pageCount > 0 ? safePage + 1 < pageCount : serverHasMore;

  return {
    leaderboard: data?.leaderboard ?? [],
    total,
    hasMore,
    pageCount,
    limit: safeLimit,
    offset,
    currentPage: safePage,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}
