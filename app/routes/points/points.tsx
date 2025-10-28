import { useAccount } from "@starknet-react/core";
import { useUserPoints } from "~/hooks/use-user-points";
import { useUserRank } from "~/hooks/use-user-rank";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "~/components/ui/card";
import { NumericFormat } from "react-number-format";
import FeatureDiscoveryCards from "~/components/dashboard/feature-discovery-cards";
import { createMeta } from "~/lib/utils/meta";
import type { Route } from "./+types/points";

export default function RewardsPage() {
  const { address } = useAccount();
  const { weeklyPoints, totals, isLoading } = useUserPoints();
  const { rank } = useUserRank();

  const totalPoints = totals?.allTimePoints || 0;
  const displayRank = rank || "—";

  const SEASON_WEEKS = Array.from({ length: 12 }, (_, index) => {
    const startDate = new Date("2025-10-10T06:00:00Z");
    startDate.setUTCDate(startDate.getUTCDate() + index * 7);
    return {
      weekNumber: index + 1,
      weekStart: startDate.toISOString().slice(0, 10),
    };
  });

  const weeklyPointsByStart = new Map<string, (typeof weeklyPoints)[number]>();
  for (const week of weeklyPoints) {
    const key = week.weekStart?.slice(0, 10);
    if (!key) continue;
    weeklyPointsByStart.set(key, week);
  }

  const displayWeeklyPoints = SEASON_WEEKS.map((preset) => {
    const data = weeklyPointsByStart.get(preset.weekStart);
    return {
      ...preset,
      totalPoints: data?.totalPoints ?? 0,
      calculatedAt: data?.calculatedAt ?? null,
      basePoints: data?.basePoints ?? 0,
      referralBonus: data?.referralBonus ?? 0,
      hasComputed: data !== undefined,
    };
  });

  // Determine rank tier based on total points
  const getRankTier = (points: number) => {
    if (points >= 500000) return { name: "Proof of Satoshi", color: "#F7931A" };
    if (points >= 200000) return { name: "Taproot Magician", color: "#9333EA" };
    if (points >= 50000) return { name: "Lambo Hunter", color: "#10B981" };
    if (points >= 17000) return { name: "Validity Chad", color: "#3B82F6" };
    if (points >= 5000) return { name: "Anon Stacker", color: "#C0C0C0" };
    if (points >= 1500) return { name: "Smol Pleb", color: "#CD7F32" };
    return { name: "Starter", color: "#94938D" };
  };

  const rankTier = getRankTier(totalPoints);

  // Get last week's points (most recent week with data)
  const lastWeekPoints = (() => {
    const computedWeeks = displayWeeklyPoints.filter(
      (week) => week.hasComputed
    );
    if (computedWeeks.length === 0) return null;
    return computedWeeks[computedWeeks.length - 1].totalPoints;
  })();

  // Format date range for weekly breakdown
  const formatWeekRange = (weekStart: string) => {
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const formatDate = (date: Date) =>
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <div className="w-full mx-auto max-w-7xl py-8 lg:py-12 px-4 sm:px-6 lg:px-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-baseline pb-6 lg:pb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]">
            Your Rewards
          </h1>
          <p className="text-sm text-[#94938D] font-sora mt-2">
            Track your points and leaderboard ranking
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:items-stretch">
        {/* Points Card - First on mobile, part of right section on desktop */}
        <div className="w-full lg:hidden order-1">
          <div className="grid grid-cols-1 gap-4 mb-6">
            {/* Points Card */}
            <Card className="rounded-2xl border-0 shadow-none bg-white">
              <CardHeader
                className="border-b border-[#F5F3EE]"
                style={{ paddingBottom: "0.75rem" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Rank Tier Badge */}
                    <div className="px-3 py-2 bg-white border border-[#F5F3EE] rounded-lg text-xs font-medium font-sora text-neutral-800 leading-tight">
                      {rankTier.name}
                    </div>
                    {/* Leaderboard Rank Display */}
                    <span className="text-sm font-medium font-sora leading-none text-neutral-800">
                      Rank #{displayRank}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-4 lg:mb-8">
                    <div className="text-xs font-medium font-sora uppercase tracking-tight text-neutral-800">
                      Total points
                    </div>
                  </div>

                  {/* Points Amount */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="text-5xl font-medium font-sora text-neutral-800">
                          {!address ? (
                            "????"
                          ) : isLoading ? (
                            "..."
                          ) : (
                            <NumericFormat
                              displayType="text"
                              value={totalPoints.toString()}
                              thousandSeparator=","
                              decimalScale={2}
                              fixedDecimalScale={true}
                            />
                          )}
                        </div>
                        {/* Points Badge */}
                        <div className="p-2.5 rounded-lg inline-flex justify-start items-center gap-2 bg-[#F5F3EE]">
                          <span className="text-sm font-medium font-sora leading-tight text-neutral-800">
                            points
                          </span>
                        </div>
                      </div>
                      <div className="text-base font-normal font-sora mt-1 text-[#AAA28E]">
                        All-time points earned
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              {/* Card Footer with Rank Details */}
              <CardFooter className="border-t border-[#F5F3EE]">
                <div className="w-full grid grid-cols-2 relative -my-6">
                  <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-[#F5F3EE]" />

                  {/* Current Rank section */}
                  <div className="pr-4 py-6">
                    <div className="text-xs font-medium font-sora uppercase tracking-tight mb-2 text-neutral-800">
                      Current Rank
                    </div>
                    <div className="text-xl font-medium font-sora text-neutral-800">
                      #{displayRank}
                    </div>
                  </div>

                  {/* Last Week's Points section */}
                  <div className="pl-6 py-6">
                    <div className="text-xs font-medium font-sora uppercase tracking-tight mb-2 text-neutral-800">
                      Last Week's Points
                    </div>
                    <div className="text-xl font-medium font-sora text-neutral-800">
                      {!address ? (
                        "—"
                      ) : isLoading ? (
                        "..."
                      ) : lastWeekPoints === null ? (
                        "—"
                      ) : (
                        <NumericFormat
                          displayType="text"
                          value={lastWeekPoints.toString()}
                          thousandSeparator=","
                          decimalScale={2}
                          fixedDecimalScale
                        />
                      )}
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Points History Table - Second on mobile, left section on desktop */}
        <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:min-w-[320px] order-2 lg:order-none flex">
          <div className="bg-white rounded-2xl p-6 w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-medium font-sora text-[#242424] mb-2">
                  Points History
                </h2>
                <p className="text-sm text-[#94938D] font-sora">
                  Weekly breakdown of your points earnings
                </p>
                <p className="text-xs text-[#AAA28E] font-sora mt-1">
                  Calculated every Friday at 10:00 UTC
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Simplified Table - Showing all weeks */}
              {displayWeeklyPoints.length > 0 ? (
                displayWeeklyPoints.map((week) => (
                  <div
                    key={`${week.weekStart}-${week.weekNumber}`}
                    className="py-3 border-b border-[#E5E5E5] last:border-0 flex items-end justify-between"
                  >
                    <div>
                      <p className="text-xs font-medium font-sora text-[#242424] mb-1">
                        Week {week.weekNumber}
                      </p>
                      <p className="text-xs font-sora text-[#94938D]">
                        {formatWeekRange(week.weekStart)}
                      </p>
                    </div>
                    <p className="text-sm font-bold font-sora text-[#242424]">
                      {!address
                        ? "—"
                        : week.hasComputed
                        ? `${week.totalPoints.toFixed(2)} pts`
                        : "—"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm font-sora text-[#94938D]">
                  {!address
                    ? "Connect your wallet to see weekly points."
                    : "No points recorded yet. Check back after the weekly calculation."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Section on Desktop - Hidden on mobile */}
        <div className="hidden lg:flex flex-1 lg:flex-[2] lg:order-none flex-col">
          <div className="mb-6">
            {/* Points Card */}
            <Card className="rounded-2xl border-0 shadow-none bg-white">
              <CardHeader
                className="border-b border-[#F5F3EE]"
                style={{ paddingBottom: "0.75rem" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Rank Tier Badge */}
                    <div className="px-3 py-2 bg-white border border-[#F5F3EE] rounded-lg text-xs font-medium font-sora text-neutral-800 leading-tight">
                      {rankTier.name}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-4 lg:mb-8">
                    <div className="text-xs font-medium font-sora uppercase tracking-tight text-neutral-800">
                      Total Points
                    </div>
                  </div>

                  {/* Points Amount */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="text-5xl font-medium font-sora text-neutral-800">
                          {!address ? (
                            "????"
                          ) : isLoading ? (
                            "..."
                          ) : (
                            <NumericFormat
                              displayType="text"
                              value={totalPoints.toString()}
                              thousandSeparator=","
                              decimalScale={2}
                              fixedDecimalScale={true}
                            />
                          )}
                        </div>
                        {/* Points Badge */}
                        <div className="p-2.5 rounded-lg inline-flex justify-start items-center gap-2 bg-[#F5F3EE]">
                          <span className="text-sm font-medium font-sora leading-tight text-neutral-800">
                            points
                          </span>
                        </div>
                      </div>
                      <div className="text-base font-normal font-sora mt-1 text-[#AAA28E]">
                        All-time points earned
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              {/* Card Footer with Rank Details */}
              <CardFooter className="border-t border-[#F5F3EE]">
                <div className="w-full grid grid-cols-2 relative -my-6">
                  {/* Full-height divider */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-[#F5F3EE]" />

                  {/* Current Rank section */}
                  <div className="pr-4 py-6">
                    <div className="text-xs font-medium font-sora uppercase tracking-tight mb-2 text-neutral-800">
                      Current Rank
                    </div>
                    <div className="text-xl font-medium font-sora text-neutral-800">
                      #{displayRank}
                    </div>
                  </div>

                  {/* Last Week's Points section */}
                  <div className="pl-6 py-6">
                    <div className="text-xs font-medium font-sora uppercase tracking-tight mb-2 text-neutral-800">
                      Last Week's Points
                    </div>
                    <div className="text-xl font-medium font-sora text-neutral-800">
                      {!address ? (
                        "—"
                      ) : isLoading ? (
                        "..."
                      ) : lastWeekPoints === null ? (
                        "—"
                      ) : (
                        <NumericFormat
                          displayType="text"
                          value={lastWeekPoints.toString()}
                          thousandSeparator=","
                          decimalScale={2}
                          fixedDecimalScale
                        />
                      )}
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>

          <div>
            <FeatureDiscoveryCards />
          </div>
        </div>

        {/* CTAs - Third on mobile */}
        <div className="w-full lg:hidden order-3">
          <FeatureDiscoveryCards />
        </div>
      </div>
    </div>
  );
}

export function meta(args: Route.MetaArgs) {
  return createMeta(args, {
    title: "Uncap - Your Rewards",
    description:
      "Track your points, leaderboard ranking, and weekly earnings on Uncap Finance",
  });
}
