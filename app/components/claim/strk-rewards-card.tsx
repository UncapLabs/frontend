import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import {
  Sparkles,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { NumericFormat } from "react-number-format";
import { useAccount } from "@starknet-react/core";
import { useWalletConnect } from "~/hooks/use-wallet-connect";

// Placeholder data structure for STRK rewards
interface WeeklyReward {
  weekNumber: number;
  weekStartDate: string;
  weekEndDate: string;
  amount: number;
  status: "claimable" | "claimed" | "pending";
  claimedAt?: string;
}

export function STRKRewardsCard() {
  const { address } = useAccount();
  const { connectWallet } = useWalletConnect();

  // TODO: Replace with actual hook when backend is ready
  // const { rewards, totalClaimable, isLoading, error, claim } = useSTRKRewards(address);

  // Check if this is the specific address with hardcoded rewards
  const isTargetAddress =
    address?.toLowerCase() ===
    "0x033446F12430CE62862707d5B0495ba79d9965671c558BA163Ab99EF06434144".toLowerCase();

  // Placeholder data for UI development
  const isLoading = false;

  // Hardcoded rewards for the specific address
  const weeklyRewards: WeeklyReward[] = isTargetAddress
    ? [
        {
          weekNumber: 1,
          weekStartDate: "2025-08-19",
          weekEndDate: "2025-08-25",
          amount: 125.75,
          status: "claimed",
          claimedAt: "2025-08-26",
        },
        {
          weekNumber: 2,
          weekStartDate: "2025-08-26",
          weekEndDate: "2025-09-01",
          amount: 148.32,
          status: "claimed",
          claimedAt: "2025-09-02",
        },
        {
          weekNumber: 3,
          weekStartDate: "2025-09-02",
          weekEndDate: "2025-09-08",
          amount: 165.4,
          status: "claimed",
          claimedAt: "2025-09-09",
        },
        {
          weekNumber: 4,
          weekStartDate: "2025-09-09",
          weekEndDate: "2025-09-15",
          amount: 189.25,
          status: "claimable",
        },
        {
          weekNumber: 5,
          weekStartDate: "2025-09-16",
          weekEndDate: "2025-09-22",
          amount: 195.5,
          status: "pending",
        },
      ]
    : [];

  // Calculate total claimable
  const totalClaimable = weeklyRewards
    .filter((r) => r.status === "claimable")
    .reduce((sum, r) => sum + r.amount, 0);

  const hasRewards = weeklyRewards.length > 0;

  const handleClaimAll = async () => {
    // TODO: Implement claim logic
    console.log("Claiming STRK rewards...");
  };

  const handleButtonClick = async () => {
    if (!address) {
      await connectWallet();
    } else {
      await handleClaimAll();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-baseline">
        <h1 className="text-2xl md:text-3xl font-medium leading-none font-sora text-neutral-800">
          STRK Rewards
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Panel - Main Content */}
        <div className="flex-1 lg:flex-[2]">
          {isLoading ? (
            <Card className="rounded-2xl border-0 shadow-none bg-white">
              <CardContent className="pt-6">
                <div className="text-center space-y-4 py-8">
                  <Sparkles className="h-12 w-12 text-purple-400 mx-auto animate-pulse" />
                  <p className="text-sm font-sora text-neutral-600">
                    Loading STRK rewards data...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : !hasRewards ? (
            <div className="bg-white rounded-2xl p-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-purple-50 rounded-2xl mx-auto flex items-center justify-center">
                  <img
                    src="/starknet.png"
                    alt="STRK"
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium font-sora text-neutral-800">
                    No STRK Rewards Yet
                  </h3>
                  <p className="text-sm font-sora text-neutral-600 max-w-lg mx-auto leading-relaxed">
                    Start earning STRK rewards by borrowing USDU. You'll receive{" "}
                    <span className="font-medium text-purple-700">
                      40% of your interest payments
                    </span>{" "}
                    back, plus an additional{" "}
                    <span className="font-medium text-purple-700">
                      2% of your collateral value
                    </span>{" "}
                    annually, all paid out weekly in STRK tokens.
                  </p>
                </div>

                {/* Two reward cards side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mt-6">
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <div className="text-2xl font-medium font-sora text-purple-700 mb-1">
                      40%
                    </div>
                    <div className="text-xs font-sora text-purple-600">
                      Interest Rebate
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <div className="text-2xl font-medium font-sora text-purple-700 mb-1">
                      2%
                    </div>
                    <div className="text-xs font-sora text-purple-600">
                      Collateral Rewards
                    </div>
                  </div>
                </div>

                {/* How to earn section */}
                <div className="bg-neutral-50 rounded-xl p-5 max-w-md mx-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium font-sora text-neutral-800">
                      Start Earning in 3 Steps
                    </span>
                  </div>
                  <div className="space-y-2 text-left">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-medium font-sora text-purple-600 mt-0.5">
                        1
                      </span>
                      <span className="text-xs font-sora text-neutral-700">
                        Open a borrowing position with BTC collateral
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-medium font-sora text-purple-600 mt-0.5">
                        2
                      </span>
                      <span className="text-xs font-sora text-neutral-700">
                        Automatically earn 40% interest rebate + 2% collateral
                        rewards
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-medium font-sora text-purple-600 mt-0.5">
                        3
                      </span>
                      <span className="text-xs font-sora text-neutral-700">
                        Claim your STRK rewards weekly from this page
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => (window.location.href = "/borrow")}
                  className="h-12 bg-token-bg-blue hover:bg-blue-600 text-white text-sm font-medium font-sora py-4 px-8 rounded-xl transition-all"
                >
                  Start Borrowing to Earn STRK
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Rewards Claim Card */}
              <div className="bg-white rounded-2xl p-6 space-y-6">
                {/* Label */}
                <div className="flex justify-between items-start">
                  <label className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight">
                    Claim Rewards
                  </label>
                </div>

                {/* Main content area - exactly like TokenInput */}
                <div className="flex items-center gap-6">
                  {/* Token selector on the left */}
                  <div className="flex flex-col gap-2">
                    <div className="p-2.5 bg-purple-50 rounded-lg inline-flex justify-start items-center gap-2">
                      <img
                        src="/starknet.png"
                        alt="STRK"
                        className="w-5 h-5 object-contain"
                      />
                      <span className="text-purple-700 text-xs font-medium font-sora">
                        STRK
                      </span>
                    </div>
                  </div>

                  {/* Amount display on the right */}
                  <div className="flex-1">
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal font-sora leading-8 sm:leading-9 md:leading-10 text-neutral-800">
                      <NumericFormat
                        displayType="text"
                        value={totalClaimable}
                        thousandSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom row: USD value on left, Available info on right */}
                <div className="flex justify-between items-center">
                  {/* USD value on bottom left */}
                  <span className="text-neutral-800 text-sm font-medium font-sora leading-none">
                    = ${(totalClaimable * 0.5).toFixed(2)}
                  </span>

                  {/* Available info on bottom right */}
                  <div className="flex items-center gap-1">
                    <span className="text-neutral-800 text-xs font-medium font-sora leading-3">
                      Available:
                    </span>
                    <span className="text-neutral-800 text-base font-medium font-sora leading-none">
                      {
                        weeklyRewards.filter((r) => r.status === "claimable")
                          .length
                      }
                    </span>
                    <span className="text-neutral-800 text-xs font-medium font-sora leading-3">
                      week
                      {weeklyRewards.filter((r) => r.status === "claimable")
                        .length !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Info Section */}
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-sora text-neutral-600">
                    Interest Rebate Rate:
                  </span>
                  <span className="font-medium font-sora text-neutral-800">
                    40% of interest
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-sora text-neutral-600">
                    Collateral Rewards:
                  </span>
                  <span className="font-medium font-sora text-neutral-800">
                    2% of collateral value
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-sora text-neutral-600">
                    Total Claimed:
                  </span>
                  <span className="font-medium font-sora text-neutral-800">
                    <NumericFormat
                      displayType="text"
                      value={weeklyRewards
                        .filter((r) => r.status === "claimed")
                        .reduce((sum, r) => sum + r.amount, 0)}
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                    />{" "}
                    STRK
                  </span>
                </div>
              </div>

              {/* Claim Button */}
              <Button
                onClick={handleButtonClick}
                disabled={address && totalClaimable === 0}
                className="w-full h-12 bg-token-bg-blue hover:bg-blue-600 text-white text-sm font-medium font-sora py-4 px-6 rounded-xl transition-all"
              >
                {!address
                  ? "Connect Wallet"
                  : totalClaimable > 0
                  ? `Claim ${totalClaimable.toFixed(2)} STRK`
                  : "No Rewards to Claim"}
              </Button>

              {/* Weekly Rewards History */}
              <Card className="rounded-2xl border-0 shadow-none bg-white">
                <CardHeader className="border-b border-[#F5F3EE]">
                  <CardTitle className="text-lg font-medium font-sora text-neutral-800 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-neutral-600" />
                    Weekly Rewards History
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {weeklyRewards.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-sora text-xs font-medium uppercase tracking-tight text-neutral-800">
                            Week
                          </TableHead>
                          <TableHead className="font-sora text-xs font-medium uppercase tracking-tight text-neutral-800">
                            Period
                          </TableHead>
                          <TableHead className="text-right font-sora text-xs font-medium uppercase tracking-tight text-neutral-800">
                            Amount
                          </TableHead>
                          <TableHead className="text-center font-sora text-xs font-medium uppercase tracking-tight text-neutral-800">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {weeklyRewards.map((reward) => (
                          <TableRow key={reward.weekNumber}>
                            <TableCell className="font-medium font-sora text-neutral-800">
                              Week {reward.weekNumber}
                            </TableCell>
                            <TableCell className="text-sm font-sora text-neutral-600">
                              {new Date(
                                reward.weekStartDate
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                reward.weekEndDate
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right font-medium font-sora text-neutral-800">
                              <NumericFormat
                                displayType="text"
                                value={reward.amount}
                                thousandSeparator=","
                                decimalScale={2}
                                fixedDecimalScale
                              />{" "}
                              STRK
                            </TableCell>
                            <TableCell className="text-center">
                              {reward.status === "claimed" ? (
                                <Badge variant="success" className="gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Claimed
                                </Badge>
                              ) : reward.status === "claimable" ? (
                                <Badge className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-100">
                                  <Sparkles className="h-3 w-3" />
                                  Claimable
                                </Badge>
                              ) : (
                                <Badge variant="pending" className="gap-1">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 text-neutral-400 mx-auto mb-3" />
                      <p className="text-sm font-sora text-neutral-600">
                        No rewards history yet
                      </p>
                      <p className="text-xs font-sora text-neutral-500 mt-2">
                        Your weekly rewards will appear here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right Panel - Info */}
        <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:min-w-[320px]">
          <Card className="rounded-2xl border-0 shadow-none bg-white lg:sticky lg:top-8">
            <CardHeader className="border-b border-[#F5F3EE]">
              <CardTitle className="text-lg font-medium font-sora text-neutral-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Your STRK Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-medium font-sora text-purple-700">
                    40%
                  </div>
                  <div className="text-xs font-sora text-purple-600 mt-1">
                    Interest Rebate
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-medium font-sora text-purple-700">
                    2%
                  </div>
                  <div className="text-xs font-sora text-purple-600 mt-1">
                    Collateral APR
                  </div>
                </div>
              </div>

              <p className="text-sm font-sora text-neutral-600">
                Earn STRK rewards by borrowing USDU. Get 40% of your interest
                back plus 2% of your collateral value annually, paid weekly.
              </p>

              <Separator className="bg-[#F5F3EE]" />

              <div>
                <h4 className="text-xs font-medium font-sora uppercase tracking-tight text-neutral-800 mb-3">
                  Example with $100k BTC
                </h4>
                <div className="bg-neutral-50 rounded-lg p-3 mb-2">
                  <div className="space-y-1 text-xs font-sora">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Collateral:</span>
                      <span className="font-medium text-neutral-700">
                        $100,000 BTC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">
                        Borrowed (50% LTV):
                      </span>
                      <span className="font-medium text-neutral-700">
                        $50,000 USDU
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Interest Rate:</span>
                      <span className="font-medium text-neutral-700">
                        5% APR ($2,500/yr)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="space-y-2 text-sm font-sora">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">
                        Interest Rebate (40%):
                      </span>
                      <span className="font-medium text-purple-700">
                        $1,000/yr
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">
                        Collateral Rewards (2%):
                      </span>
                      <span className="font-medium text-purple-700">
                        $2,000/yr
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-purple-200">
                      <span className="text-neutral-700 font-medium">
                        Total STRK/Week:
                      </span>
                      <span className="font-medium text-purple-700">
                        ~$57.69
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs font-sora text-neutral-500 space-y-1">
                <p>• Rewards distributed weekly</p>
                <p>• Never expire - claim anytime</p>
                <p>• STRK price may fluctuate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
