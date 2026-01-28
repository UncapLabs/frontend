import { useQuery } from "@tanstack/react-query";
import { NumericFormat } from "react-number-format";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { RefreshCw, AlertTriangle, ExternalLink, Wallet, ChartPie } from "lucide-react";
import type { Route } from "./+types/vault";
import { createMeta } from "~/lib/utils/meta";
import { createCaller } from "../../../workers/router";
import { useTRPC } from "~/lib/trpc";
import {
  Card,
  CardContent,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { getCollateralByBranchId } from "~/lib/collateral";

const CHART_COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#8B5CF6"];

// Badge component for position types
function PositionBadge({ children, color = "blue" }: { children: React.ReactNode; color?: "blue" | "green" | "purple" }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium font-sora ${colorClasses[color]}`}>
      {children}
    </span>
  );
}

export async function loader({ context }: Route.LoaderArgs) {
  const caller = createCaller({
    env: context.cloudflare.env,
    executionCtx: context.cloudflare.ctx,
  });

  try {
    const [analyticsData, lagoonData] = await Promise.all([
      caller.vaultRouter.getAnalytics(),
      caller.vaultRouter.getLagoonVault().catch((err) => {
        console.error("Lagoon data fetch failed in loader:", err);
        return null;
      }),
    ]);
    return { initialData: analyticsData, lagoonData, error: null };
  } catch (error) {
    console.error("Error loading vault analytics:", error);
    return {
      initialData: null,
      lagoonData: null,
      error: error instanceof Error ? error.message : "Failed to load vault data",
    };
  }
}


function formatUsd(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
}

function calculateLTV(collateralWbtc: number, debtUsdu: number, btcPrice: number): number | null {
  if (collateralWbtc <= 0 || btcPrice <= 0) return null;
  const collateralUsd = collateralWbtc * btcPrice;
  if (collateralUsd <= 0) return null;
  return (debtUsdu / collateralUsd) * 100;
}

function getLtvColorClass(ltv: number): string {
  if (ltv >= 80) return "text-red-600";
  if (ltv >= 70) return "text-orange-600";
  return "text-green-600";
}

function LoadingSkeleton() {
  return (
    <div className="w-full mx-auto max-w-7xl py-8 lg:py-8 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="flex justify-between pb-6 lg:pb-4 items-baseline">
        <Skeleton className="h-12 w-48" />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-5">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="md:col-span-2 bg-white rounded-xl p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-white rounded-xl p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="w-full mx-auto max-w-7xl py-8 lg:py-8 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="flex justify-between pb-6 lg:pb-4 items-baseline">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]">
          Vault Analytics
        </h1>
      </div>
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-600 font-sora mb-4">{message}</p>
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function VaultPage({ loaderData }: Route.ComponentProps) {
  const trpc = useTRPC();

  const { data, isLoading, error, refetch } = useQuery({
    ...trpc.vaultRouter.getAnalytics.queryOptions(undefined, {
      staleTime: 30_000,
      refetchInterval: 60_000,
    }),
    initialData: loaderData.initialData ?? undefined,
  });

  const { data: lagoonData } = useQuery({
    ...trpc.vaultRouter.getLagoonVault.queryOptions(undefined, {
      staleTime: 5 * 60_000,
      refetchInterval: 5 * 60_000,
    }),
    initialData: loaderData.lagoonData ?? undefined,
  });

  if (isLoading && !data) {
    return <LoadingSkeleton />;
  }

  if (error || loaderData.error || !data) {
    return (
      <ErrorState
        message={error?.message || loaderData.error || "Failed to load vault data"}
        onRetry={() => refetch()}
      />
    );
  }

  const btcPrice = parseFloat(data.btcPrice);

  // Calculate totals for the positions table
  let totalCollateralWbtc = 0;
  let totalDebtUsdu = 0;
  let totalStabilityPoolUsdu = 0;
  let totalStabilityPoolYieldGain = 0;

  for (const branch of data.branches) {
    // Collateral is in 18 decimals (wrapped)
    totalCollateralWbtc += parseFloat(branch.collateral) / 1e18;
    totalDebtUsdu += parseFloat(branch.debt) / 1e18;
    totalStabilityPoolUsdu += parseFloat(branch.stabilityPoolUsdu) / 1e18;
    totalStabilityPoolYieldGain += parseFloat(branch.stabilityPoolYieldGain) / 1e18;
  }

  const totalStabilityPoolValue = totalStabilityPoolUsdu + totalStabilityPoolYieldGain;

  const pieData = data.allocations.map((alloc, index) => ({
    name: alloc.name,
    value: alloc.value,
    usdValue: alloc.usdValue,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <div className="w-full mx-auto max-w-7xl py-8 lg:py-8 px-4 sm:px-6 lg:px-8 pb-32">
      {/* Vault Header */}
      <div className="bg-white rounded-2xl p-6 md:p-8 mb-6">
        {/* Lagoon branding + deposit CTA */}
        {lagoonData && (
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-6">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="/lagoon.png"
                  alt="Lagoon"
                  className="w-10 h-10 md:w-11 md:h-11 rounded-full flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl md:text-2xl font-semibold font-sora text-[#242424] tracking-tight">
                      {lagoonData.name}
                    </h1>
                    {/* <span className="text-[11px] font-medium font-sora text-[#94938D] bg-[#F5F3EE] px-2 py-0.5 rounded">
                      {lagoonData.symbol}
                    </span> */}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[13px] text-[#AAA28E] font-sora">
                    {lagoonData.curator && <span>Managed by {lagoonData.curator.name}</span>}
                    <span className="text-[#D4D0C8]">·</span>
                    <span>{lagoonData.underlyingAsset.symbol} on Ethereum</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[#6B6B6B] font-sora leading-relaxed max-w-2xl">
                {lagoonData.shortDescription || lagoonData.description}
              </p>
            </div>

            <a
              href={lagoonData.depositUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#006CFF] hover:bg-[#0056CC] text-white font-sora font-medium text-sm px-6 py-3 rounded-xl transition-colors flex-shrink-0"
            >
              Deposit on Lagoon
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Analytics subtitle */}
        <h2 className="text-lg md:text-xl font-semibold font-sora text-[#242424] mb-5">
          Vault Analytics
        </h2>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-[#F5F3EE] rounded-xl p-4 md:p-5 min-w-0">
            <p className="text-[10px] md:text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-tight mb-1 md:mb-2">
              Net Assets Value (USD)
            </p>
            <p className="text-lg md:text-2xl font-semibold font-sora text-[#242424] truncate">
              <NumericFormat
                displayType="text"
                value={parseFloat(data.totalNavUsd).toFixed(0)}
                thousandSeparator=","
                prefix="$"
              />
            </p>
          </div>
          <div className="bg-[#F5F3EE] rounded-xl p-4 md:p-5 min-w-0">
            <p className="text-[10px] md:text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-tight mb-1 md:mb-2">
              Net Assets Value (BTC)
            </p>
            <p className="text-lg md:text-2xl font-semibold font-sora text-[#242424] truncate">
              {parseFloat(data.totalNavWbtc).toFixed(4)}
            </p>
          </div>
          <div className="bg-[#F5F3EE] rounded-xl p-4 md:p-5 min-w-0">
            <p className="text-[10px] md:text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-tight mb-1 md:mb-2">
              BTC Price
            </p>
            <p className="text-lg md:text-2xl font-semibold font-sora text-[#242424] truncate">
              <NumericFormat
                displayType="text"
                value={btcPrice.toFixed(0)}
                thousandSeparator=","
                prefix="$"
              />
            </p>
          </div>
          <div className="bg-[#F5F3EE] rounded-xl p-4 md:p-5 min-w-0">
            <p className="text-[10px] md:text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-tight mb-1 md:mb-2">
              Networks
            </p>
            <div className="flex items-center gap-2">
              <img src="/eth.svg" alt="Ethereum" className="w-6 h-6" />
              <img src="/starknet.png" alt="Starknet" className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {data.warnings.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-sora font-medium text-amber-800 text-sm">Warnings</p>
              <ul className="mt-1 text-sm text-amber-700 font-sora">
                {data.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Debank Style */}
      <div className="space-y-6 mb-6">
        {/* Top Row: Allocation + Wallet */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {/* Allocation Pie Chart */}
          <Card className="md:col-span-1 min-w-0 overflow-hidden">
            <CardContent className="pt-6 px-4 md:px-6">
              <div className="flex items-center gap-2 md:gap-3 mb-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <ChartPie className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                </div>
                <span className="text-base md:text-lg font-semibold font-sora text-[#242424]">Allocation</span>
              </div>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => {
                        const numValue = typeof value === "number" ? value : 0;
                        const usdValue = props?.payload?.usdValue ?? "0";
                        return [`${numValue.toFixed(1)}% (${formatUsd(usdValue)})`, name];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-44 flex items-center justify-center text-[#94938D] font-sora text-sm">
                  No data
                </div>
              )}
              {/* Legend */}
              <div className="space-y-2 mt-4">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs font-sora">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-[#242424]">{item.name}</span>
                    </div>
                    <span className="text-[#94938D]">{item.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Wallet Section */}
          <Card className="md:col-span-2 min-w-0 overflow-hidden">
            <CardContent className="pt-6 px-4 md:px-6">
              {/* Wallet Header */}
              <div className="flex items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                  </div>
                  <span className="text-base md:text-lg font-semibold font-sora text-[#242424]">Wallet</span>
                </div>
                <NumericFormat
                  displayType="text"
                  value={(parseFloat(data.walletBalances.ethereum.totalUsd) + parseFloat(data.walletBalances.starknet.totalUsd)).toFixed(2)}
                  thousandSeparator=","
                  prefix="$"
                  className="text-base md:text-lg font-semibold font-sora text-[#242424]"
                />
              </div>

              {/* Wallet Token Table */}
              <div className="overflow-x-auto -mx-4 px-4 md:-mx-6 md:px-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#E5E5E5] hover:bg-transparent">
                    <TableHead className="h-10 py-2 px-2 md:px-4 text-xs font-medium font-sora text-[#94938D]">
                      Token
                    </TableHead>
                    <TableHead className="h-10 py-2 px-2 md:px-4 text-xs font-medium font-sora text-[#94938D] text-right">
                      Price
                    </TableHead>
                    <TableHead className="h-10 py-2 px-2 md:px-4 text-xs font-medium font-sora text-[#94938D] text-right">
                      Amount
                    </TableHead>
                    <TableHead className="h-10 py-2 px-2 md:px-4 text-xs font-medium font-sora text-[#94938D] text-right">
                      USD Value
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Ethereum WBTC */}
                  {parseFloat(data.walletBalances.ethereum.wbtc) > 0 && (
                    <TableRow className="border-[#E5E5E5] hover:bg-[#F5F3EE]/50">
                      <TableCell className="py-3 px-2 md:px-4">
                        <div className="flex items-center gap-2">
                          <div className="relative w-5 h-5 md:w-6 md:h-6 flex-shrink-0">
                            <img src="/wbtc.png" alt="WBTC" className="w-full h-full" />
                            <img src="/eth.svg" alt="Ethereum" className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white" />
                          </div>
                          <span className="font-sora font-medium text-[#242424] text-sm">WBTC</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-2 md:px-4 text-right">
                        <NumericFormat
                          displayType="text"
                          value={btcPrice.toFixed(2)}
                          thousandSeparator=","
                          prefix="$"
                          className="font-sora text-xs md:text-sm text-[#242424]"
                        />
                      </TableCell>
                      <TableCell className="py-3 px-2 md:px-4 text-right">
                        <span className="font-sora text-xs md:text-sm text-[#242424]">
                          {(parseFloat(data.walletBalances.ethereum.wbtc) / 1e8).toFixed(8)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-2 md:px-4 text-right">
                        <NumericFormat
                          displayType="text"
                          value={data.walletBalances.ethereum.totalUsd}
                          thousandSeparator=","
                          prefix="$"
                          className="font-sora text-xs md:text-sm text-[#242424]"
                        />
                      </TableCell>
                    </TableRow>
                  )}
                  {/* Starknet WBTC */}
                  {parseFloat(data.walletBalances.starknet.wbtc) > 0 && (
                    <TableRow className="border-[#E5E5E5] hover:bg-[#F5F3EE]/50">
                      <TableCell className="py-3 px-2 md:px-4">
                        <div className="flex items-center gap-2">
                          <div className="relative w-5 h-5 md:w-6 md:h-6 flex-shrink-0">
                            <img src="/wbtc.png" alt="WBTC" className="w-full h-full" />
                            <img src="/starknet.png" alt="Starknet" className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white" />
                          </div>
                          <span className="font-sora font-medium text-[#242424] text-sm">WBTC</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-2 md:px-4 text-right">
                        <NumericFormat
                          displayType="text"
                          value={btcPrice.toFixed(2)}
                          thousandSeparator=","
                          prefix="$"
                          className="font-sora text-xs md:text-sm text-[#242424]"
                        />
                      </TableCell>
                      <TableCell className="py-3 px-2 md:px-4 text-right">
                        <span className="font-sora text-xs md:text-sm text-[#242424]">
                          {(parseFloat(data.walletBalances.starknet.wbtc) / 1e8).toFixed(8)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-2 md:px-4 text-right">
                        <NumericFormat
                          displayType="text"
                          value={((parseFloat(data.walletBalances.starknet.wbtc) / 1e8) * btcPrice).toFixed(2)}
                          thousandSeparator=","
                          prefix="$"
                          className="font-sora text-xs md:text-sm text-[#242424]"
                        />
                      </TableCell>
                    </TableRow>
                  )}
                  {/* Starknet USDU */}
                  {parseFloat(data.walletBalances.starknet.usdu) > 0 && (
                    <TableRow className="border-[#E5E5E5] hover:bg-[#F5F3EE]/50">
                      <TableCell className="py-3 px-2 md:px-4">
                        <div className="flex items-center gap-2">
                          <div className="relative w-5 h-5 md:w-6 md:h-6 flex-shrink-0">
                            <img src="/usdu.png" alt="USDU" className="w-full h-full" />
                            <img src="/starknet.png" alt="Starknet" className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white" />
                          </div>
                          <span className="font-sora font-medium text-[#242424] text-sm">USDU</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-2 md:px-4 text-right">
                        <span className="font-sora text-xs md:text-sm text-[#242424]">$1.00</span>
                      </TableCell>
                      <TableCell className="py-3 px-2 md:px-4 text-right">
                        <NumericFormat
                          displayType="text"
                          value={(parseFloat(data.walletBalances.starknet.usdu) / 1e18).toFixed(2)}
                          thousandSeparator=","
                          className="font-sora text-xs md:text-sm text-[#242424]"
                        />
                      </TableCell>
                      <TableCell className="py-3 px-2 md:px-4 text-right">
                        <NumericFormat
                          displayType="text"
                          value={(parseFloat(data.walletBalances.starknet.usdu) / 1e18).toFixed(2)}
                          thousandSeparator=","
                          prefix="$"
                          className="font-sora text-xs md:text-sm text-[#242424]"
                        />
                      </TableCell>
                    </TableRow>
                  )}
                  {/* Starknet USDC */}
                  {parseFloat(data.walletBalances.starknet.usdc) > 0 && (
                    <TableRow className="border-[#E5E5E5] hover:bg-[#F5F3EE]/50">
                      <TableCell className="py-3 px-2 md:px-4">
                        <div className="flex items-center gap-2">
                          <div className="relative w-5 h-5 md:w-6 md:h-6 flex-shrink-0">
                            <img src="/usdc.svg" alt="USDC" className="w-full h-full" />
                            <img src="/starknet.png" alt="Starknet" className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white" />
                          </div>
                          <span className="font-sora font-medium text-[#242424] text-sm">USDC</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-2 md:px-4 text-right">
                        <span className="font-sora text-xs md:text-sm text-[#242424]">$1.00</span>
                      </TableCell>
                      <TableCell className="py-3 px-2 md:px-4 text-right">
                        <NumericFormat
                          displayType="text"
                          value={(parseFloat(data.walletBalances.starknet.usdc) / 1e6).toFixed(2)}
                          thousandSeparator=","
                          className="font-sora text-xs md:text-sm text-[#242424]"
                        />
                      </TableCell>
                      <TableCell className="py-3 px-2 md:px-4 text-right">
                        <NumericFormat
                          displayType="text"
                          value={(parseFloat(data.walletBalances.starknet.usdc) / 1e6).toFixed(2)}
                          thousandSeparator=","
                          prefix="$"
                          className="font-sora text-xs md:text-sm text-[#242424]"
                        />
                      </TableCell>
                    </TableRow>
                  )}
                  {/* Starknet USDC.e */}
                  {parseFloat(data.walletBalances.starknet.usdce) > 0 && (
                    <TableRow className="border-[#E5E5E5] hover:bg-[#F5F3EE]/50">
                      <TableCell className="py-3 px-2 md:px-4">
                        <div className="flex items-center gap-2">
                          <div className="relative w-5 h-5 md:w-6 md:h-6 flex-shrink-0">
                            <img src="/usdc.svg" alt="USDC.e" className="w-full h-full" />
                            <img src="/starknet.png" alt="Starknet" className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white" />
                          </div>
                          <span className="font-sora font-medium text-[#242424] text-sm">USDC.e</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-2 md:px-4 text-right">
                        <span className="font-sora text-xs md:text-sm text-[#242424]">$1.00</span>
                      </TableCell>
                      <TableCell className="py-3 px-2 md:px-4 text-right">
                        <NumericFormat
                          displayType="text"
                          value={(parseFloat(data.walletBalances.starknet.usdce) / 1e6).toFixed(2)}
                          thousandSeparator=","
                          className="font-sora text-xs md:text-sm text-[#242424]"
                        />
                      </TableCell>
                      <TableCell className="py-3 px-2 md:px-4 text-right">
                        <NumericFormat
                          displayType="text"
                          value={(parseFloat(data.walletBalances.starknet.usdce) / 1e6).toFixed(2)}
                          thousandSeparator=","
                          prefix="$"
                          className="font-sora text-xs md:text-sm text-[#242424]"
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DeFi Positions - Full Width */}
        {/* Uncap Protocol Section */}
          <Card className="min-w-0 overflow-hidden">
            <CardContent className="pt-6 px-4 md:px-6">
              {/* Protocol Header */}
              <div className="flex items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <img src="/uncap.png" alt="Uncap" className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0" />
                  <span className="text-base md:text-lg font-semibold font-sora text-[#242424]">Uncap</span>
                  <a
                    href="https://uncap.finance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#94938D] hover:text-[#242424] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <NumericFormat
                  displayType="text"
                  value={(totalCollateralWbtc * btcPrice - totalDebtUsdu + totalStabilityPoolValue).toFixed(2)}
                  thousandSeparator=","
                  prefix="$"
                  className="text-base md:text-lg font-semibold font-sora text-[#242424]"
                />
              </div>

              {/* Borrowing Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <PositionBadge color="blue">Borrowing</PositionBadge>
                  <span className="text-xs text-[#94938D] font-sora">
                    LTV:{" "}
                    {(() => {
                      const totalLtv = calculateLTV(totalCollateralWbtc, totalDebtUsdu, btcPrice);
                      return totalLtv !== null ? (
                        <span className={getLtvColorClass(totalLtv)}>{totalLtv.toFixed(1)}%</span>
                      ) : (
                        "—"
                      );
                    })()}
                  </span>
                </div>

                <div className="overflow-x-auto -mx-4 px-4 md:-mx-6 md:px-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#E5E5E5] hover:bg-transparent">
                      <TableHead className="h-10 py-2 px-2 md:px-4 text-xs font-medium font-sora text-[#94938D]">
                        Supplied
                      </TableHead>
                      <TableHead className="h-10 py-2 px-2 md:px-4 text-xs font-medium font-sora text-[#94938D] text-right">
                        Balance
                      </TableHead>
                      <TableHead className="h-10 py-2 px-2 md:px-4 text-xs font-medium font-sora text-[#94938D] text-right">
                        USD Value
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.branches.map((branch) => {
                      const collateral = getCollateralByBranchId(branch.branchId);
                      const collateralWbtc = parseFloat(branch.collateral) / 1e18;
                      if (collateralWbtc <= 0) return null;
                      return (
                        <TableRow key={`supply-${branch.branchId}`} className="border-[#E5E5E5] hover:bg-[#F5F3EE]/50">
                          <TableCell className="py-3 px-2 md:px-4">
                            <div className="flex items-center gap-2">
                              {collateral && (
                                <img src={collateral.icon} alt={collateral.symbol} className="w-5 h-5" />
                              )}
                              <span className="font-sora font-medium text-[#242424] text-sm">
                                {collateral?.symbol ?? branch.branchName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-2 md:px-4 text-right">
                            <span className="font-sora text-xs md:text-sm text-[#242424]">
                              {collateralWbtc.toFixed(8)} BTC
                            </span>
                          </TableCell>
                          <TableCell className="py-3 px-2 md:px-4 text-right">
                            <NumericFormat
                              displayType="text"
                              value={(collateralWbtc * btcPrice).toFixed(2)}
                              thousandSeparator=","
                              prefix="$"
                              className="font-sora text-xs md:text-sm text-[#242424]"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                </div>

                {/* Borrowed Section */}
                <div className="overflow-x-auto -mx-6 px-6 mt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#E5E5E5] hover:bg-transparent">
                      <TableHead className="h-10 py-2 px-2 md:px-4 text-xs font-medium font-sora text-[#94938D]">
                        Borrowed
                      </TableHead>
                      <TableHead className="h-10 py-2 px-2 md:px-4 text-xs font-medium font-sora text-[#94938D] text-right">
                        Balance
                      </TableHead>
                      <TableHead className="h-10 py-2 px-2 md:px-4 text-xs font-medium font-sora text-[#94938D] text-right">
                        USD Value
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.branches.map((branch) => {
                      const collateral = getCollateralByBranchId(branch.branchId);
                      const debtUsdu = parseFloat(branch.debt) / 1e18;
                      if (debtUsdu <= 0) return null;
                      return (
                        <TableRow key={`debt-${branch.branchId}`} className="border-[#E5E5E5] hover:bg-[#F5F3EE]/50">
                          <TableCell className="py-3 px-2 md:px-4">
                            <div className="flex items-center gap-2">
                              <img src="/usdu.png" alt="USDU" className="w-5 h-5" />
                              <span className="font-sora font-medium text-[#242424] text-sm">
                                USDU
                              </span>
                              <span className="text-xs text-[#94938D] font-sora hidden md:inline">
                                ({collateral?.symbol ?? branch.branchName})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-2 md:px-4 text-right">
                            <NumericFormat
                              displayType="text"
                              value={debtUsdu.toFixed(2)}
                              thousandSeparator=","
                              className="font-sora text-xs md:text-sm text-red-600"
                            />
                          </TableCell>
                          <TableCell className="py-3 px-2 md:px-4 text-right">
                            <NumericFormat
                              displayType="text"
                              value={debtUsdu.toFixed(2)}
                              thousandSeparator=","
                              prefix="-$"
                              allowNegative={false}
                              className="font-sora text-xs md:text-sm text-red-600"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                </div>
              </div>

              {/* Stability Pool Section */}
              {totalStabilityPoolValue > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <PositionBadge color="green">Stability Pool</PositionBadge>
                  </div>

                  <div className="overflow-x-auto -mx-4 px-4 md:-mx-6 md:px-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-[#E5E5E5] hover:bg-transparent">
                        <TableHead className="h-10 py-2 px-2 md:px-4 text-xs font-medium font-sora text-[#94938D]">
                          Position
                        </TableHead>
                        <TableHead className="h-10 py-2 px-2 md:px-4 text-xs font-medium font-sora text-[#94938D] text-right">
                          Balance
                        </TableHead>
                        <TableHead className="h-10 py-2 px-2 md:px-4 text-xs font-medium font-sora text-[#94938D] text-right">
                          USD Value
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.branches.map((branch) => {
                        const collateral = getCollateralByBranchId(branch.branchId);
                        const spUsdu = parseFloat(branch.stabilityPoolUsdu) / 1e18;
                        const spYieldGain = parseFloat(branch.stabilityPoolYieldGain) / 1e18;
                        if (spUsdu <= 0 && spYieldGain <= 0) return null;
                        return (
                          <>
                            {/* Deposited USDU */}
                            {spUsdu > 0 && (
                              <TableRow key={`sp-deposit-${branch.branchId}`} className="border-[#E5E5E5] hover:bg-[#F5F3EE]/50">
                                <TableCell className="py-3 px-2 md:px-4">
                                  <div className="flex items-center gap-2">
                                    <img src="/usdu.png" alt="USDU" className="w-5 h-5" />
                                    <span className="font-sora font-medium text-[#242424] text-sm">
                                      USDU
                                    </span>
                                    <span className="text-xs text-[#94938D] font-sora hidden md:inline">
                                      ({collateral?.symbol ?? branch.branchName} pool)
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-3 px-2 md:px-4 text-right">
                                  <NumericFormat
                                    displayType="text"
                                    value={spUsdu.toFixed(2)}
                                    thousandSeparator=","
                                    className="font-sora text-xs md:text-sm text-[#242424]"
                                  />
                                </TableCell>
                                <TableCell className="py-3 px-2 md:px-4 text-right">
                                  <NumericFormat
                                    displayType="text"
                                    value={spUsdu.toFixed(2)}
                                    thousandSeparator=","
                                    prefix="$"
                                    className="font-sora text-xs md:text-sm text-[#242424]"
                                  />
                                </TableCell>
                              </TableRow>
                            )}
                            {/* Yield Gain */}
                            {spYieldGain > 0 && (
                              <TableRow key={`sp-yield-${branch.branchId}`} className="border-[#E5E5E5] hover:bg-[#F5F3EE]/50">
                                <TableCell className="py-3 px-2 md:px-4">
                                  <div className="flex items-center gap-2">
                                    <img src="/usdu.png" alt="USDU" className="w-5 h-5" />
                                    <span className="font-sora font-medium text-green-600 text-sm">
                                      Yield Gain
                                    </span>
                                    <span className="text-xs text-[#94938D] font-sora hidden md:inline">
                                      ({collateral?.symbol ?? branch.branchName} pool)
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-3 px-2 md:px-4 text-right">
                                  <NumericFormat
                                    displayType="text"
                                    value={spYieldGain.toFixed(2)}
                                    thousandSeparator=","
                                    className="font-sora text-xs md:text-sm text-green-600"
                                  />
                                </TableCell>
                                <TableCell className="py-3 px-2 md:px-4 text-right">
                                  <NumericFormat
                                    displayType="text"
                                    value={spYieldGain.toFixed(2)}
                                    thousandSeparator=","
                                    prefix="+$"
                                    className="font-sora text-xs md:text-sm text-green-600"
                                  />
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        );
                      })}
                    </TableBody>
                  </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extended Vault Section */}
          {parseFloat(data.extendedVaultUsd) > 0 && (
            <Card className="min-w-0 overflow-hidden">
              <CardContent className="pt-6 px-4 md:px-6">
                <div className="flex items-center justify-between mb-4 gap-2">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <img src="/extended.jpg" alt="Extended" className="w-7 h-7 md:w-8 md:h-8 rounded-full flex-shrink-0" />
                    <span className="text-base md:text-lg font-semibold font-sora text-[#242424]">Extended</span>
                  </div>
                  <NumericFormat
                    displayType="text"
                    value={parseFloat(data.extendedVaultUsd).toFixed(2)}
                    thousandSeparator=","
                    prefix="$"
                    className="text-base md:text-lg font-semibold font-sora text-[#242424]"
                  />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <PositionBadge color="green">DeFi Position</PositionBadge>
                </div>

                <div className="overflow-x-auto -mx-4 px-4 md:-mx-6 md:px-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#E5E5E5] hover:bg-transparent">
                      <TableHead className="h-10 py-2 px-2 md:px-4 text-xs font-medium font-sora text-[#94938D]">
                        Position
                      </TableHead>
                      <TableHead className="h-10 py-2 px-2 md:px-4 text-xs font-medium font-sora text-[#94938D] text-right">
                        USD Value
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-[#E5E5E5] hover:bg-[#F5F3EE]/50">
                      <TableCell className="py-3 px-2 md:px-4">
                        <span className="font-sora font-medium text-[#242424] text-sm">
                          Extended Vault Holdings
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-2 md:px-4 text-right">
                        <NumericFormat
                          displayType="text"
                          value={parseFloat(data.extendedVaultUsd).toFixed(2)}
                          thousandSeparator=","
                          prefix="$"
                          className="font-sora text-xs md:text-sm text-[#242424]"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          )}

      </div>
    </div>
  );
}

export function meta(args: Route.MetaArgs) {
  return createMeta(args, {
    title: "Uncap - Lagoon Vault Analytics",
    description:
      "Real-time transparency into Uncap's Lagoon vault holdings and allocations",
  });
}
