import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import type { ColumnDef } from "@tanstack/react-table";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { NumericFormat } from "react-number-format";
import { useQueryState, parseAsInteger, parseAsStringEnum } from "nuqs";

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
import { useLeaderboard } from "~/hooks/use-leaderboard";
import { cn } from "~/lib/utils";

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

const PAGE_SIZE = 50;

type SeasonOptionValue = (typeof SEASON_OPTIONS)[number]["value"];
const SEASON_VALUES = SEASON_OPTIONS.map((option) => option.value) as SeasonOptionValue[];

function shortenAddress(address: string): string {
  if (!address) return "—";
  return address.length > 10
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : address;
}

export default function LeaderboardPage() {
  const { address } = useAccount();
  const [seasonSelection = "all", setSeasonSelection] = useQueryState<SeasonOptionValue>(
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

  const { leaderboard, total, hasMore, isLoading, error } = useLeaderboard(
    seasonNumber,
    pageIndex,
    PAGE_SIZE
  );

  const columns = useMemo<ColumnDef<LeaderboardEntry>[]>(() => {
    return [
      {
        accessorKey: "rank",
        header: "#",
        cell: ({ row }) => (
          <span className="font-sora text-sm text-[#242424]">
            {row.original.rank}
          </span>
        ),
      },
      {
        accessorKey: "userAddress",
        header: "User",
        cell: ({ row }) => {
          const userAddress = row.original.userAddress;
          const isCurrentUser =
            address &&
            userAddress.toLowerCase() === address.toLowerCase();

          return (
            <span
              className={cn(
                "font-mono text-xs tracking-wide text-[#242424]",
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
        cell: ({ row }) => (
          <NumericFormat
            displayType="text"
            value={row.original.points}
            thousandSeparator
            decimalScale={2}
            fixedDecimalScale={false}
            className="font-sora text-sm font-medium text-[#242424]"
          />
        ),
      },
      {
        accessorKey: "totalReferrals",
        header: "Referrals",
        cell: ({ row }) => (
          <NumericFormat
            displayType="text"
            value={row.original.totalReferrals}
            thousandSeparator
            decimalScale={0}
            className="font-sora text-sm text-[#242424]"
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
        pageSize: PAGE_SIZE,
      },
    },
  });

  const startRank = pageIndex * PAGE_SIZE + 1;
  const endRank = pageIndex * PAGE_SIZE + leaderboard.length;
  const hasRange = leaderboard.length > 0;
  const hasTotal = typeof total === "number" && !Number.isNaN(total);

  const handleSeasonChange = (value: SeasonOptionValue) => {
    void setSeasonSelection(value);
    void setPageParam(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      void setPageParam(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      void setPageParam(currentPage + 1);
    }
  };

  return (
    <div className="w-full mx-auto max-w-7xl py-8 lg:py-12 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="flex flex-col md:flex-row md:justify-between md:items-baseline pb-6 lg:pb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]">
            Leaderboard
          </h1>
          <p className="text-sm text-[#94938D] font-sora mt-2">
            Track top Uncap participants across seasons
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={seasonSelection}
            onValueChange={(value) =>
              handleSeasonChange(value as SeasonOptionValue)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Season" />
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

      <div className="bg-white rounded-2xl border border-[#F5F3EE] shadow-sm">
        <div className="px-6 py-4 border-b border-[#F5F3EE] flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-medium font-sora text-[#242424]">
              {seasonSelection === "all"
                ? "All-time standings"
                : `Season ${seasonSelection} standings`}
            </h2>
            <p className="text-xs text-[#AAA28E] font-sora">
              Updated hourly based on on-chain activity
            </p>
          </div>
          <div className="text-xs font-sora text-[#AAA28E]">
            Showing{" "}
            <span className="font-semibold text-[#242424]">
              {hasRange ? (
                <>
                  <NumericFormat
                    displayType="text"
                    value={startRank}
                    thousandSeparator
                  />
                  {"-"}
                  <NumericFormat
                    displayType="text"
                    value={endRank}
                    thousandSeparator
                  />
                </>
              ) : (
                "—"
              )}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#242424]">
              {hasTotal ? (
                <NumericFormat
                  displayType="text"
                  value={total}
                  thousandSeparator
                />
              ) : (
                "—"
              )}
            </span>{" "}
            players
          </div>
        </div>

        <Table className="min-w-[640px]">
          <TableHeader className="bg-[#F5F5F5]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-none">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs uppercase tracking-wider text-[#AAA28E]">
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-sm text-[#AAA28E]">
                  Loading standings…
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-sm text-[#C62828]">
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
                    className={cn(
                      "border-[#F5F3EE]",
                      isCurrentUser && "bg-[#006CFF]/5"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-sm text-[#AAA28E]">
                  No rankings available yet. Check back soon.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="px-6 py-4 border-t border-[#F5F3EE] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-sora text-[#AAA28E]">
            Page {currentPage}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage <= 1 || isLoading}
              className="font-sora text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!hasMore || isLoading}
              className="font-sora text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
