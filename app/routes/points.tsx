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
import WalletNotConnectedCTA from "~/components/dashboard/wallet-not-connected-cta";

export default function RewardsPage() {
  const { address } = useAccount();
  const { weeklyPoints, totals, isLoading } = useUserPoints();
  const { rank } = useUserRank();

  // Hardcoded test data
  const testAddress =
    "0x033446F12430CE62862707d5B0495ba79d9965671c558BA163Ab99EF06434144";
  const isTestAddress = address?.toLowerCase() === testAddress.toLowerCase();

  const totalPoints = isTestAddress ? 9215.42 : totals?.allTimePoints || 0;
  const displayRank = isTestAddress ? "418" : rank || "—";

  // Hardcoded all weeks - Week 1 starts October 10, 2025
  const allWeeks = [
    {
      seasonNumber: 1,
      weekStart: "2025-10-10",
      totalPoints: isTestAddress ? 39.0 : 0,
    },
    {
      seasonNumber: 2,
      weekStart: "2025-10-17",
      totalPoints: 0,
    },
    {
      seasonNumber: 3,
      weekStart: "2025-10-24",
      totalPoints: 0,
    },
    {
      seasonNumber: 4,
      weekStart: "2025-10-31",
      totalPoints: 0,
    },
    {
      seasonNumber: 5,
      weekStart: "2025-11-07",
      totalPoints: 0,
    },
    { seasonNumber: 6, weekStart: "2025-11-14", totalPoints: 0 },
    { seasonNumber: 7, weekStart: "2025-11-21", totalPoints: 0 },
    { seasonNumber: 8, weekStart: "2025-11-28", totalPoints: 0 },
    { seasonNumber: 9, weekStart: "2025-12-05", totalPoints: 0 },
    { seasonNumber: 10, weekStart: "2025-12-12", totalPoints: 0 },
    { seasonNumber: 11, weekStart: "2025-12-19", totalPoints: 0 },
    { seasonNumber: 12, weekStart: "2025-12-26", totalPoints: 0 },
  ];

  const displayWeeklyPoints = allWeeks;

  // Determine rank tier based on total points
  const getRankTier = (points: number) => {
    if (points >= 10000) return { name: "Diamond", color: "#B9F2FF" };
    if (points >= 5000) return { name: "Platinum", color: "#E5E4E2" };
    if (points >= 2500) return { name: "Gold", color: "#FFD700" };
    if (points >= 1000) return { name: "Silver", color: "#C0C0C0" };
    if (points >= 500) return { name: "Bronze", color: "#CD7F32" };
    return { name: "Starter", color: "#94938D" };
  };

  const rankTier = getRankTier(totalPoints);

  // Get last week's points (most recent week with data)
  const lastWeekPoints =
    displayWeeklyPoints.find((w) => w.totalPoints > 0)?.totalPoints || 0;

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
                      Total Xpoints
                    </div>
                  </div>

                  {/* Points Amount */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div>
                      <div className="flex items-baseline gap-3">
                        <div className="text-5xl font-medium font-sora text-neutral-800">
                          {!address ? (
                            "????"
                          ) : isLoading && !isTestAddress ? (
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
                        <div className="p-2.5 rounded-lg inline-flex justify-start items-center gap-2 bg-[#F5F3EE]">
                          <span className="text-sm font-medium font-sora leading-tight text-neutral-800">
                            Xpoints
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
                      ) : isLoading && !isTestAddress ? (
                        "..."
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
              </div>
            </div>

            <div className="space-y-3">
              {/* Simplified Table - Showing all weeks */}
              {displayWeeklyPoints.map((week, idx) => (
                <div
                  key={idx}
                  className="py-3 border-b border-[#E5E5E5] last:border-0 flex items-end justify-between"
                >
                  <div>
                    <p className="text-xs font-medium font-sora text-[#242424] mb-1">
                      Week {week.seasonNumber}
                    </p>
                    <p className="text-xs font-sora text-[#94938D]">
                      {formatWeekRange(week.weekStart)}
                    </p>
                  </div>
                  <p className="text-sm font-bold font-sora text-[#242424]">
                    {!address
                      ? "—"
                      : week.totalPoints > 0
                      ? week.totalPoints.toFixed(2) + " pts"
                      : "—"}
                  </p>
                </div>
              ))}
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
                      <div className="flex items-baseline gap-3">
                        <div className="text-5xl font-medium font-sora text-neutral-800">
                          {!address ? (
                            "????"
                          ) : isLoading && !isTestAddress ? (
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
                      ) : isLoading && !isTestAddress ? (
                        "..."
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
            <WalletNotConnectedCTA />
          </div>
        </div>

        {/* CTAs - Third on mobile */}
        <div className="w-full lg:hidden order-3">
          <WalletNotConnectedCTA />
        </div>
      </div>
    </div>
  );
}
