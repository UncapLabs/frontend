import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
import { NumericFormat } from "react-number-format";
import { useQueryState, parseAsInteger, parseAsStringEnum } from "nuqs";
import type { Route } from "./+types/stats";
import { useQuery } from "@tanstack/react-query";
import Big from "big.js";

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
import { ALL_POSITIONS_PAGE_SIZE } from "../../workers/services/protocol-stats";
import { createCaller } from "../../workers/router";
import { useTRPC } from "~/lib/trpc";
import { getCollateralByBranchId, type CollateralId } from "~/lib/collateral";
import { useCollateralPrice } from "~/hooks/use-fetch-prices";

type PositionEntry = {
  id: string;
  troveId: string;
  borrower: string;
  debt: string;
  deposit: string;
  interestRate: string;
  status: string;
  collateralSymbol: string;
  collateralBranchId: number;
  createdAt: number;
  updatedAt: number;
  closedAt: number | null;
  redeemedColl: string | null;
  redeemedDebt: string | null;
  liquidationTx: string | null;
  batchManager: string | null;
  batchInterestRate: string | null;
};

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Closed", value: "closed" },
  { label: "Liquidated", value: "liquidated" },
  { label: "Zombie", value: "redeemed" },
] as const;

type StatusOptionValue = (typeof STATUS_OPTIONS)[number]["value"];
const STATUS_VALUES = STATUS_OPTIONS.map(
  (option) => option.value
) as StatusOptionValue[];

// Server-side loader for SSR - defaults to active positions
export async function loader({ context }: Route.LoaderArgs) {
  const caller = createCaller({
    env: context.cloudflare.env,
    executionCtx: context.cloudflare.ctx,
  });

  try {
    const data = await caller.protocolStatsRouter.getAllPositions({
      status: "active",
      limit: ALL_POSITIONS_PAGE_SIZE,
      offset: 0,
    });

    return {
      initialData: {
        positions: data.positions,
        total: data.total,
        hasMore: data.hasMore,
        pageCount: data.pageCount,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error loading positions:", error);
    return {
      initialData: {
        positions: [],
        total: 0,
        hasMore: false,
        pageCount: 0,
      },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

const DECIMALS_18 = new Big(10).pow(18);

function shortenAddress(address: string): string {
  if (!address) return "—";
  return address.length > 10
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : address;
}

function formatDebt(debt: string): string {
  try {
    // Debt is stored with 18 decimals
    const bigDebt = new Big(debt).div(DECIMALS_18);
    return bigDebt.toFixed(2);
  } catch {
    return "0.00";
  }
}

function formatDeposit(deposit: string): string {
  try {
    // Deposit is stored with 18 decimals (wrapped token)
    const bigDeposit = new Big(deposit).div(DECIMALS_18);
    return bigDeposit.toFixed(8);
  } catch {
    return "0.00000000";
  }
}

function formatInterestRate(rate: string): string {
  try {
    // Interest rate is stored with 18 decimals as a decimal (e.g., 0.05e18 for 5%)
    const bigRate = new Big(rate).div(DECIMALS_18);
    // Multiply by 100 to get percentage
    return bigRate.times(100).toFixed(2) + "%";
  } catch {
    return "0.00%";
  }
}

function calculateLiquidationPrice(
  debt: string,
  deposit: string,
  branchId: number
): string | null {
  try {
    const collateral = getCollateralByBranchId(branchId);
    if (!collateral) return null;

    const bigDebt = new Big(debt).div(DECIMALS_18);
    const bigDeposit = new Big(deposit).div(DECIMALS_18);

    if (bigDeposit.lte(0) || bigDebt.lte(0)) {
      return null;
    }

    // Liquidation Price = (Debt * MCR) / Collateral
    const liquidationPrice = bigDebt
      .times(collateral.minCollateralizationRatio)
      .div(bigDeposit);
    return liquidationPrice.toFixed(2);
  } catch {
    return null;
  }
}

function calculateLTV(
  debt: string,
  deposit: string,
  btcPrice: Big | null
): string | null {
  try {
    if (!btcPrice || btcPrice.lte(0)) return null;

    const bigDebt = new Big(debt).div(DECIMALS_18);
    const bigDeposit = new Big(deposit).div(DECIMALS_18);

    if (bigDeposit.lte(0)) return null;

    // Collateral Value = Deposit * BTC Price
    const collateralValue = bigDeposit.times(btcPrice);

    if (collateralValue.lte(0)) return null;

    // LTV = Debt / Collateral Value * 100
    const ltv = bigDebt.div(collateralValue).times(100);
    return ltv.toFixed(2);
  } catch {
    return null;
  }
}

export default function StatsPage({ loaderData }: Route.ComponentProps) {
  "use no memo";

  const trpc = useTRPC();

  // Fetch BTC price for LTV calculation
  const btcPriceData = useCollateralPrice("WWBTC" as CollateralId);
  const btcPriceBig = btcPriceData?.price ?? null;

  const [statusSelection = "active", setStatusSelection] =
    useQueryState<StatusOptionValue>(
      "status",
      parseAsStringEnum<StatusOptionValue>(STATUS_VALUES).withDefault("active")
    );

  const [pageParam = 1, setPageParam] = useQueryState(
    "page",
    parseAsInteger.withDefault(1)
  );

  // Sort state via URL
  type SortFieldType = "debt" | "deposit" | "interestRate" | "createdAt" | "updatedAt" | "ltv" | "liquidationPrice";
  const SORT_FIELDS = ["debt", "deposit", "interestRate", "createdAt", "updatedAt", "ltv", "liquidationPrice"] as const;
  type SortDirType = "asc" | "desc";
  const SORT_DIRS = ["asc", "desc"] as const;

  const [sortBy = "debt", setSortBy] = useQueryState<SortFieldType>(
    "sortBy",
    parseAsStringEnum<SortFieldType>([...SORT_FIELDS]).withDefault("debt")
  );
  const [sortDir = "desc", setSortDir] = useQueryState<SortDirType>(
    "sortDir",
    parseAsStringEnum<SortDirType>([...SORT_DIRS]).withDefault("desc")
  );

  const currentPage = Math.max(1, pageParam);
  const pageIndex = currentPage - 1;
  const offset = pageIndex * ALL_POSITIONS_PAGE_SIZE;

  // Use React Query with SSR data as initial data
  const isInitialLoad = statusSelection === "active" && pageIndex === 0 && sortBy === "debt" && sortDir === "desc";
  const { data, isFetching, error } = useQuery({
    ...trpc.protocolStatsRouter.getAllPositions.queryOptions(
      {
        status: statusSelection,
        limit: ALL_POSITIONS_PAGE_SIZE,
        offset,
        sortBy,
        sortDirection: sortDir,
      },
      {
        staleTime: 60_000,
        placeholderData: (previous) => previous,
        initialData: isInitialLoad ? loaderData.initialData : undefined,
      }
    ),
  });

  const positions = data?.positions ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.pageCount ?? 0;
  const hasMore = data?.hasMore ?? false;

  // Map column IDs to sort fields
  const columnToSortField: Record<string, SortFieldType> = {
    deposit: "deposit",
    debt: "debt",
    effectiveInterestRate: "interestRate",
    liquidationPrice: "liquidationPrice",
    ltv: "ltv",
  };

  const handleSort = (columnId: string) => {
    const field = columnToSortField[columnId];
    if (!field) return;

    if (sortBy === field) {
      // Toggle direction
      void setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      // New field, default to desc
      void setSortBy(field);
      void setSortDir("desc");
    }
    // Reset to first page on sort change
    void setPageParam(1);
  };

  const columns = useMemo<ColumnDef<PositionEntry>[]>(() => {
    return [
      {
        accessorKey: "collateralSymbol",
        header: "Collateral",
        size: 100,
        cell: ({ row }) => (
          <span className="font-sora text-sm font-medium text-neutral-800">
            {row.original.collateralSymbol}
          </span>
        ),
      },
      {
        accessorKey: "borrower",
        header: "Borrower",
        size: 160,
        cell: ({ row }) => (
          <a
            href={`https://voyager.online/contract/${row.original.borrower}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs tracking-wide text-blue-600 hover:text-blue-800 hover:underline"
            title={row.original.borrower}
            onClick={(e) => e.stopPropagation()}
          >
            {shortenAddress(row.original.borrower)}
          </a>
        ),
      },
      {
        accessorKey: "deposit",
        header: "Deposit",
        size: 140,
        cell: ({ row }) => {
          const isLiquidated = row.original.status === "liquidated";
          const closedAt = row.original.closedAt;

          if (isLiquidated && closedAt) {
            return (
              <div className="flex flex-col">
                <span className="font-sora text-xs text-red-600 font-medium">
                  Liquidated
                </span>
                <span className="font-sora text-xs text-neutral-500">
                  {new Date(closedAt).toLocaleDateString()}
                </span>
              </div>
            );
          }

          return (
            <span className="font-sora text-sm font-medium text-neutral-800">
              {formatDeposit(row.original.deposit)}
            </span>
          );
        },
      },
      {
        accessorKey: "debt",
        header: "Debt (USDU)",
        size: 140,
        cell: ({ row }) => {
          const isLiquidated = row.original.status === "liquidated";
          const liquidationTx = row.original.liquidationTx;

          if (isLiquidated && liquidationTx) {
            return (
              <a
                href={`https://starkscan.co/tx/${liquidationTx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sora text-xs text-blue-600 hover:text-blue-800 underline"
              >
                View tx
              </a>
            );
          }

          return (
            <NumericFormat
              displayType="text"
              value={formatDebt(row.original.debt)}
              thousandSeparator=","
              decimalScale={2}
              fixedDecimalScale={true}
              className="font-sora text-sm font-medium text-neutral-800"
            />
          );
        },
      },
      {
        id: "effectiveInterestRate",
        header: "Interest Rate",
        size: 120,
        cell: ({ row }) => {
          const { interestRate, batchInterestRate, batchManager } = row.original;
          // Use batch interest rate if available
          const effectiveRate = batchInterestRate || interestRate;
          const isBatchManaged = !!batchManager;

          return (
            <div className="flex flex-col">
              <span className="font-sora text-sm font-medium text-neutral-800">
                {formatInterestRate(effectiveRate)}
              </span>
              {isBatchManaged && (
                <span className="font-sora text-xs text-purple-600">Telos</span>
              )}
            </div>
          );
        },
      },
      {
        id: "liquidationPrice",
        header: "Liq. Price",
        size: 100,
        cell: ({ row }) => {
          const { debt, deposit, collateralBranchId, status } = row.original;

          // Only show for active positions
          if (status !== "active") {
            return <span className="font-sora text-sm text-neutral-400">—</span>;
          }

          const liqPrice = calculateLiquidationPrice(
            debt,
            deposit,
            collateralBranchId
          );

          if (!liqPrice) {
            return <span className="font-sora text-sm text-neutral-400">—</span>;
          }

          return (
            <NumericFormat
              displayType="text"
              value={liqPrice}
              thousandSeparator=","
              prefix="$"
              decimalScale={2}
              fixedDecimalScale={true}
              className="font-sora text-sm font-medium text-neutral-800"
            />
          );
        },
      },
      {
        id: "ltv",
        header: "LTV",
        size: 80,
        cell: ({ row }) => {
          const { debt, deposit, status } = row.original;

          // Only show for active positions
          if (status !== "active") {
            return <span className="font-sora text-sm text-neutral-400">—</span>;
          }

          const ltv = calculateLTV(debt, deposit, btcPriceBig);

          if (!ltv) {
            return <span className="font-sora text-sm text-neutral-400">—</span>;
          }

          // Color based on LTV risk level
          const ltvNum = parseFloat(ltv);
          let colorClass = "text-green-600"; // Safe: < 70%
          if (ltvNum >= 80) {
            colorClass = "text-red-600"; // High risk: >= 80%
          } else if (ltvNum >= 70) {
            colorClass = "text-orange-600"; // Medium risk: 70-80%
          }

          return (
            <span className={`font-sora text-sm font-medium ${colorClass}`}>
              {ltv}%
            </span>
          );
        },
      },
      {
        accessorKey: "redeemedColl",
        header: "Redeemed Coll",
        size: 120,
        cell: ({ row }) => {
          const redeemed = row.original.redeemedColl;
          if (!redeemed || redeemed === "0") {
            return <span className="font-sora text-sm text-neutral-400">—</span>;
          }
          return (
            <span className="font-sora text-sm font-medium text-orange-600">
              {formatDeposit(redeemed)}
            </span>
          );
        },
      },
      {
        accessorKey: "redeemedDebt",
        header: "Redeemed Debt",
        size: 120,
        cell: ({ row }) => {
          const redeemed = row.original.redeemedDebt;
          if (!redeemed || redeemed === "0") {
            return <span className="font-sora text-sm text-neutral-400">—</span>;
          }
          return (
            <NumericFormat
              displayType="text"
              value={formatDebt(redeemed)}
              thousandSeparator=","
              decimalScale={2}
              fixedDecimalScale={true}
              className="font-sora text-sm font-medium text-orange-600"
            />
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 100,
        cell: ({ row }) => {
          const status = row.original.status;
          const statusColors: Record<string, string> = {
            active: "text-green-600 bg-green-50",
            closed: "text-gray-600 bg-gray-100",
            liquidated: "text-red-600 bg-red-50",
            redeemed: "text-orange-600 bg-orange-50",
          };
          const statusLabels: Record<string, string> = {
            active: "Active",
            closed: "Closed",
            liquidated: "Liquidated",
            redeemed: "Zombie",
          };
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-sora ${statusColors[status] || "text-neutral-800"}`}
            >
              {statusLabels[status] || status}
            </span>
          );
        },
      },
    ];
  }, [btcPriceBig]);

  const table = useReactTable({
    data: positions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    state: {
      pagination: {
        pageIndex,
        pageSize: ALL_POSITIONS_PAGE_SIZE,
      },
    },
  });

  const startRank = pageIndex * ALL_POSITIONS_PAGE_SIZE + 1;
  const endRank = pageIndex * ALL_POSITIONS_PAGE_SIZE + positions.length;
  const hasRange = positions.length > 0;
  const hasTotal = typeof total === "number" && !Number.isNaN(total);
  const safeCurrentPage =
    pageCount && currentPage > pageCount ? pageCount : currentPage;
  const nextDisabled =
    isFetching || !hasMore || (pageCount > 0 && safeCurrentPage >= pageCount);
  const prevDisabled = isFetching || safeCurrentPage <= 1;

  const handleStatusChange = (value: StatusOptionValue) => {
    void setStatusSelection(value);
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
          All Positions
        </h1>

        <div className="hidden lg:flex items-end gap-1.5">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium font-sora leading-none text-[#AAA28E] tracking-tight uppercase pl-2.5">
              Filter by
            </p>
            <Select
              value={statusSelection}
              onValueChange={(value) =>
                handleStatusChange(value as StatusOptionValue)
              }
            >
              <SelectTrigger className="w-56 px-6 py-4 bg-white border-0 rounded-xl font-sora text-xs font-medium text-[#242424] hover:bg-neutral-50 transition-colors !h-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
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
              {statusSelection.charAt(0).toUpperCase() +
                statusSelection.slice(1)}{" "}
              Positions
            </h2>
            <p className="text-sm text-[#94938D] font-sora">
              Browse all protocol positions
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
            positions
          </div>
        </div>

        <Table className="min-w-[640px]">
          <TableHeader className="bg-[#FAFAFA]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-[#E5E5E5] hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => {
                  const columnId = header.column.id;
                  const sortField = columnToSortField[columnId];
                  const canSort = !!sortField;
                  const isCurrentSort = sortBy === sortField;
                  const currentDir = isCurrentSort ? sortDir : null;

                  return (
                    <TableHead
                      key={header.id}
                      className={`h-12 py-3 px-4 text-xs font-medium font-sora uppercase tracking-tight text-neutral-800 ${canSort ? "cursor-pointer select-none hover:bg-[#F0F0F0]" : ""}`}
                      style={{ width: header.getSize() }}
                      onClick={canSort ? () => handleSort(columnId) : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {canSort && (
                          <span className={isCurrentSort ? "text-blue-600" : "text-neutral-400"}>
                            {currentDir === "asc"
                              ? " ↑"
                              : currentDir === "desc"
                                ? " ↓"
                                : " ↕"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
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
                  Failed to load positions. Please try again later.
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-[#E5E5E5] hover:bg-[#F5F3EE]/50 transition-colors"
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
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="py-12 text-center text-sm font-sora text-[#94938D]"
                >
                  No positions available.
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
