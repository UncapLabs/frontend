import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { NumericFormat } from "react-number-format";
import { useQueryState, parseAsInteger, parseAsStringEnum } from "nuqs";
import type { Route } from "./+types/leaderboard";
import { useQuery } from "@tanstack/react-query";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { LEADERBOARD_PAGE_SIZE } from "~/hooks/use-leaderboard";
import { cn } from "~/lib/utils";
import { createCaller } from "../../../workers/router";
import { useTRPC } from "~/lib/trpc";

type LeaderboardEntry = {
  rank: number;
  userAddress: string;
  points: number;
  totalReferrals: number;
};

const SEASON_OPTIONS = [
  { label: "All-time", value: "all" },
  { label: "Season 1", value: "1" },
  { label: "Season 2", value: "2" },
  { label: "Season 3", value: "3" },
] as const;

type SeasonOptionValue = (typeof SEASON_OPTIONS)[number]["value"];
const SEASON_VALUES = SEASON_OPTIONS.map(
  (option) => option.value
) as SeasonOptionValue[];

// Server-side loader for SSR - defaults to all-time
export async function loader({ context }: Route.LoaderArgs) {
  const caller = createCaller({
    env: context.cloudflare.env,
    executionCtx: context.cloudflare.ctx,
  });

  try {
    // Default to all-time for initial SSR
    const data = await caller.pointsRouter.getLeaderboard({
      seasonNumber: undefined,
      limit: LEADERBOARD_PAGE_SIZE,
      offset: 0,
    });

    return {
      initialData: {
        leaderboard: data.leaderboard,
        total: data.total,
        hasMore: data.hasMore,
        pageCount: data.pageCount,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error loading leaderboard:", error);
    return {
      initialData: {
        leaderboard: [],
        total: 0,
        hasMore: false,
        pageCount: 0,
      },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function shortenAddress(address: string): string {
  if (!address) return "—";
  return address.length > 10
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : address;
}

export default function LeaderboardPage({ loaderData }: Route.ComponentProps) {
  "use no memo";

  const { address } = useAccount();
  const trpc = useTRPC();

  const [seasonSelection = "all", setSeasonSelection] =
    useQueryState<SeasonOptionValue>(
      "season",
      parseAsStringEnum<SeasonOptionValue>(SEASON_VALUES).withDefault("all")
    );

  const [pageParam = 1, setPageParam] = useQueryState(
    "page",
    parseAsInteger.withDefault(1)
  );

  const currentPage = Math.max(1, pageParam);
  const seasonNumber =
    seasonSelection === "all" ? undefined : Number(seasonSelection);

  const pageIndex = currentPage - 1;
  const offset = pageIndex * LEADERBOARD_PAGE_SIZE;

  // Use React Query with SSR data as initial data
  const isInitialLoad = seasonSelection === "all" && pageIndex === 0;
  const { data, isFetching, error } = useQuery({
    ...trpc.pointsRouter.getLeaderboard.queryOptions(
      {
        seasonNumber,
        limit: LEADERBOARD_PAGE_SIZE,
        offset,
      },
      {
        staleTime: 60_000,
        placeholderData: (previous) => previous,
        initialData: isInitialLoad ? loaderData.initialData : undefined,
      }
    ),
  });

  const leaderboard = data?.leaderboard ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.pageCount ?? 0;
  const hasMore = data?.hasMore ?? false;

  const columns = useMemo<ColumnDef<LeaderboardEntry>[]>(() => {
    return [
      {
        accessorKey: "rank",
        header: "#",
        size: 80,
        cell: ({ row }) => (
          <span className="font-sora text-sm font-medium text-neutral-800">
            {row.original.rank}
          </span>
        ),
      },
      {
        accessorKey: "userAddress",
        header: "User",
        size: 200,
        cell: ({ row }) => {
          const userAddress = row.original.userAddress;
          const isCurrentUser =
            address && userAddress.toLowerCase() === address.toLowerCase();

          return (
            <span
              className={cn(
                "font-mono text-xs tracking-wide text-neutral-800",
                isCurrentUser && "font-semibold text-[#006CFF]"
              )}
              title={userAddress}
            >
              {shortenAddress(userAddress)}
            </span>
          );
        },
      },
      {
        accessorKey: "points",
        header: "Points",
        size: 150,
        cell: ({ row }) => (
          <NumericFormat
            displayType="text"
            value={row.original.points}
            thousandSeparator=","
            decimalScale={2}
            fixedDecimalScale={false}
            className="font-sora text-sm font-medium text-neutral-800"
          />
        ),
      },
      {
        accessorKey: "totalReferrals",
        header: "Referrals",
        size: 120,
        cell: ({ row }) => (
          <NumericFormat
            displayType="text"
            value={row.original.totalReferrals}
            thousandSeparator=","
            decimalScale={0}
            className="font-sora text-sm font-medium text-neutral-800"
          />
        ),
      },
    ];
  }, [address]);

  const table = useReactTable({
    data: leaderboard,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    state: {
      pagination: {
        pageIndex,
        pageSize: LEADERBOARD_PAGE_SIZE,
      },
    },
  });

  const startRank = pageIndex * LEADERBOARD_PAGE_SIZE + 1;
  const endRank = pageIndex * LEADERBOARD_PAGE_SIZE + leaderboard.length;
  const hasRange = leaderboard.length > 0;
  const hasTotal = typeof total === "number" && !Number.isNaN(total);
  const safeCurrentPage =
    pageCount && currentPage > pageCount ? pageCount : currentPage;
  const nextDisabled =
    isFetching || !hasMore || (pageCount > 0 && safeCurrentPage >= pageCount);
  const prevDisabled = isFetching || safeCurrentPage <= 1;

  const handleSeasonChange = (value: SeasonOptionValue) => {
    void setSeasonSelection(value);
    void setPageParam(1);
  };
  const handlePreviousPage = () => {
    if (prevDisabled) return;
    void setPageParam(Math.max(1, safeCurrentPage - 1));
  };
  const handleNextPage = () => {
    if (nextDisabled) return;
    void setPageParam(safeCurrentPage + 1);
  };

  return (
    <div className="w-full mx-auto max-w-7xl py-8 lg:py-8 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="flex justify-between pb-6 lg:pb-4 items-baseline-last">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]">
          Leaderboard
        </h1>

        <div className="hidden lg:flex items-end gap-1.5">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium font-sora leading-none text-[#AAA28E] tracking-tight uppercase pl-2.5">
              Filter by
            </p>
            <Select
              value={seasonSelection}
              onValueChange={(value) =>
                handleSeasonChange(value as SeasonOptionValue)
              }
            >
              <SelectTrigger className="w-56 px-6 py-4 bg-white border-0 rounded-xl font-sora text-xs font-medium text-[#242424] hover:bg-neutral-50 transition-colors !h-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEASON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-0 shadow-none">
        <div className="px-6 py-4 border-b border-[#F5F3EE] flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-medium font-sora text-[#242424] mb-2">
              {seasonSelection === "all"
                ? "All-time standings"
                : `Season ${seasonSelection} standings`}
            </h2>
            <p className="text-sm text-[#94938D] font-sora">
              Track top Uncap participants • Updated weekly on Friday at 10 AM
              UTC
            </p>
          </div>
          <div className="text-xs font-medium font-sora text-neutral-800">
            Showing{" "}
            <span className="font-semibold text-neutral-800">
              {hasRange ? (
                <>
                  <NumericFormat
                    displayType="text"
                    value={startRank}
                    thousandSeparator=","
                  />
                  {"-"}
                  <NumericFormat
                    displayType="text"
                    value={endRank}
                    thousandSeparator=","
                  />
                </>
              ) : (
                "—"
              )}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-neutral-800">
              {hasTotal ? (
                <NumericFormat
                  displayType="text"
                  value={total}
                  thousandSeparator=","
                />
              ) : (
                "—"
              )}
            </span>{" "}
            players
          </div>
        </div>

        <Table className="min-w-[640px]">
          <TableHeader className="bg-[#FAFAFA]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-[#E5E5E5] hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-12 py-3 px-4 text-xs font-medium font-sora uppercase tracking-tight text-neutral-800"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {error || loaderData.error ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="py-12 text-center text-sm font-sora text-red-600"
                >
                  Failed to load leaderboard. Please try again later.
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const isCurrentUser =
                  address &&
                  row.original.userAddress.toLowerCase() ===
                    address.toLowerCase();

                return (
                  <TableRow
                    key={row.id}
                    onClick={() => {
                      window.open(
                        `https://portfolio.ready.co/overview/${row.original.userAddress}`,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                    className={cn(
                      "border-[#E5E5E5] hover:bg-[#F5F3EE]/50 transition-colors cursor-pointer",
                      isCurrentUser && "bg-[#006CFF]/5 hover:bg-[#006CFF]/10"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-3 px-4"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="py-12 text-center text-sm font-sora text-[#94938D]"
                >
                  No rankings available yet. Check back soon.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="px-6 py-4 border-t border-[#F5F3EE] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-medium font-sora text-neutral-800">
            Page {safeCurrentPage}
            {pageCount > 0 ? ` of ${pageCount}` : ""}
            {isFetching ? (
              <span className="text-[#94938D]"> • Updating…</span>
            ) : (
              ""
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={prevDisabled}
              className="font-sora text-xs font-medium border-neutral-200 hover:bg-[#F5F3EE] disabled:opacity-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={nextDisabled}
              className="font-sora text-xs font-medium border-neutral-200 hover:bg-[#F5F3EE] disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
