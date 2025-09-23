import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Sparkles, Calendar, TrendingUp, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Alert, AlertDescription } from "~/components/ui/alert";
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
        <h2 className="text-2xl font-semibold text-slate-800">
          STRK Rebate Rewards
        </h2>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-purple-100 rounded-full">
            <span className="text-xs font-medium text-purple-700">
              30% Interest Rebate
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Panel - Main Content */}
        <div className="md:col-span-2">
          {isLoading ? (
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center space-y-4 py-8">
                  <Sparkles className="h-12 w-12 text-purple-400 mx-auto animate-pulse" />
                  <p className="text-sm text-slate-600">
                    Loading STRK rewards data...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : !hasRewards ? (
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center space-y-4 py-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-slate-800">
                      No STRK Rewards Yet
                    </h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      You'll earn STRK rewards when you borrow USDU. You get a
                      30% rebate on your interest payments, paid weekly in STRK
                      tokens.
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 max-w-sm mx-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">
                        How to earn STRK rewards:
                      </span>
                    </div>
                    <ul className="space-y-1 text-xs text-purple-700">
                      <li>1. Open a borrowing position</li>
                      <li>2. Pay interest on your loan</li>
                      <li>3. Receive 30% back as STRK weekly</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Alert for claimable rewards */}
              {totalClaimable > 0 && (
                <Alert className="border-purple-200 bg-purple-50">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-purple-800">
                    <div className="space-y-2">
                      <p className="font-semibold">
                        You have STRK rewards ready to claim!
                      </p>
                      <p className="text-sm">
                        Total claimable: {totalClaimable.toFixed(2)} STRK
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Rewards Summary Card */}
              <Card className="border border-purple-200 shadow-sm bg-purple-50">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-slate-800">
                        Total Claimable STRK
                      </h3>
                      <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">
                          Available to Claim
                        </span>
                        <span className="text-2xl font-bold text-purple-700">
                          <NumericFormat
                            displayType="text"
                            value={totalClaimable}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />{" "}
                          STRK
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleButtonClick}
                      disabled={address && totalClaimable === 0}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                      size="lg"
                    >
                      {!address
                        ? "Connect Wallet"
                        : totalClaimable > 0
                        ? `Claim ${totalClaimable.toFixed(2)} STRK`
                        : "No Rewards to Claim"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Rewards History */}
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-600" />
                    Weekly Rewards History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weeklyRewards.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Week</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {weeklyRewards.map((reward) => (
                          <TableRow key={reward.weekNumber}>
                            <TableCell className="font-medium">
                              Week {reward.weekNumber}
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">
                              {new Date(
                                reward.weekStartDate
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                reward.weekEndDate
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
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
                                <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                  Claimed
                                </span>
                              ) : reward.status === "claimable" ? (
                                <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                                  Claimable
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-full">
                                  Pending
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-600">
                        No rewards history yet
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
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
        <div className="md:col-span-1">
          <Card className="border border-slate-200 shadow-sm sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                About STRK Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-700 mb-2">
                  What are STRK rewards?
                </h4>
                <p className="text-sm text-slate-600">
                  When you borrow USDU, you receive a 30% rebate on your
                  interest payments. This rebate is paid out weekly in STRK
                  tokens.
                </p>
              </div>

              <Separator className="bg-slate-100" />

              <div>
                <h4 className="font-medium text-slate-700 mb-2">
                  How it works
                </h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>• Borrow USDU with any collateral</li>
                  <li>• Pay interest on your loan</li>
                  <li>• Get 30% of interest back as STRK</li>
                  <li>• Rewards distributed weekly</li>
                  <li>• Claim anytime after distribution</li>
                </ul>
              </div>

              <Separator className="bg-slate-100" />

              <div>
                <h4 className="font-medium text-slate-700 mb-2">
                  Example Calculation
                </h4>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Yearly Interest:</span>
                      <span className="font-medium">$1,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Rebate (30%):</span>
                      <span className="font-medium text-purple-700">$300</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-purple-200">
                      <span className="text-slate-700 font-medium">
                        Weekly STRK:
                      </span>
                      <span className="font-bold text-purple-700">~$5.77</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              <div>
                <h4 className="font-medium text-slate-700 mb-2">
                  Important Notes
                </h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>• Rewards never expire</li>
                  <li>• Claim multiple weeks at once</li>
                  <li>• STRK price may fluctuate</li>
                  <li>• Gas fees apply when claiming</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
