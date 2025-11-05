import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
import { useClaimStrk, useStrkAlreadyClaimed } from "~/hooks/use-claim-strk";
import {
  useStrkClaimCalldata,
  useStrkAllocationAmount,
  useStrkRoundBreakdown,
} from "~/hooks/use-strk-claim";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { TOKENS } from "~/lib/collateral";
import { bigintToBig, bigToBigint } from "~/lib/decimal";
import { useCallback, useMemo } from "react";
import type Big from "big.js";

// Helper to get week dates - Week 1 starts Nov 5, 2025
function getWeekDates(weekNumber: number): { start: string; end: string } {
  const weekStartDate = new Date("2025-11-05");
  const startDate = new Date(weekStartDate);
  startDate.setDate(weekStartDate.getDate() + (weekNumber - 1) * 7);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 7);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
}

export function STRKRewardsCard() {
  const { address } = useAccount();
  const { connectWallet } = useWalletConnect();

  // Fetch data from hooks
  const { alreadyClaimed, refetch: refetchClaimed } = useStrkAlreadyClaimed();

  const { data: allocationData, refetch: refetchAllocation } =
    useStrkAllocationAmount();

  const { data: calldataResponse, refetch: refetchCalldata } =
    useStrkClaimCalldata();

  const { data: roundBreakdown } = useStrkRoundBreakdown();

  // Allocation amount comes as Big from TRPC
  const totalAllocation = useMemo(() => {
    if (!allocationData) return 0n;
    try {
      return bigToBigint(allocationData, TOKENS.STRK.decimals);
    } catch {
      return 0n;
    }
  }, [allocationData]);

  // Calldata returns the cumulative allocation; subtract what’s already claimed
  const calldataAmount = useMemo(() => {
    if (!calldataResponse?.amount) return undefined;
    try {
      return BigInt(calldataResponse.amount);
    } catch {
      return undefined;
    }
  }, [calldataResponse]);

  const claimableAmount = useMemo(() => {
    const remainingFromCalldata =
      calldataAmount !== undefined
        ? calldataAmount - alreadyClaimed
        : undefined;

    if (remainingFromCalldata !== undefined) {
      return remainingFromCalldata > 0n ? remainingFromCalldata : 0n;
    }

    if (totalAllocation > 0n && alreadyClaimed >= 0n) {
      const fallbackRemaining = totalAllocation - alreadyClaimed;
      return fallbackRemaining > 0n ? fallbackRemaining : 0n;
    }

    return 0n;
  }, [calldataAmount, totalAllocation, alreadyClaimed]);

  // Claim transaction hook
  const {
    send,
    isPending,
    isSending,
    error: transactionError,
    transactionHash,
    currentState,
    formData,
    reset,
  } = useClaimStrk({
    amount: calldataResponse?.amount,
    proof: calldataResponse?.proof,
    enabled: Boolean(
      address && calldataResponse?.amount && calldataResponse?.proof
    ),
    onSuccess: () => {
      // Refresh data after successful claim
      refetchClaimed();
      refetchAllocation();
      refetchCalldata();
    },
  });

  // Convert amounts to Big for display
  const claimableBig = bigintToBig(claimableAmount, TOKENS.STRK.decimals);
  const alreadyClaimedBig = bigintToBig(alreadyClaimed, TOKENS.STRK.decimals);
  const hasClaimableRewards = claimableAmount > 0n;

  const handleClaimAll = async () => {
    if (!address) {
      await connectWallet();
      return;
    }

    if (!calldataResponse?.amount || !calldataResponse?.proof) {
      console.error("Missing claim calldata");
      return;
    }

    try {
      await send();
    } catch (error) {
      console.error("Claim error:", error);
    }
  };

  const handleComplete = useCallback(() => {
    if (currentState === "error") {
      // Reset for retry
      reset();
    } else {
      // Stay on page after success
      reset();
    }
  }, [currentState, reset]);

  const handleButtonClick = async () => {
    if (!address) {
      await connectWallet();
    } else {
      await handleClaimAll();
    }
  };

  return (
    <>
      <div className="flex justify-between pb-6 items-baseline">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]">
          STRK Rewards
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Panel - Main Content */}
        <div className="flex-1 lg:flex-[2]">
          {/* Transaction Status - Show during pending/success/error */}
          {["pending", "success", "error"].includes(currentState) ? (
            <TransactionStatus
              transactionHash={transactionHash}
              isError={currentState === "error"}
              isSuccess={currentState === "success"}
              error={
                transactionError ? new Error(transactionError.message) : null
              }
              successTitle="STRK Claimed Successfully!"
              successSubtitle="Your STRK rewards have been claimed and sent to your wallet."
              details={
                currentState === "success" && formData.amount
                  ? [
                      {
                        label: "Amount Claimed",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={bigintToBig(
                                BigInt(formData.amount),
                                TOKENS.STRK.decimals
                              ).toString()}
                              thousandSeparator=","
                              decimalScale={2}
                              fixedDecimalScale
                            />{" "}
                            STRK
                          </>
                        ),
                      },
                    ]
                  : undefined
              }
              onComplete={handleComplete}
              completeButtonText={
                currentState === "error" ? "Try Again" : "Done"
              }
            />
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
                    <div className="p-2.5 bg-token-bg-strk/10 rounded-lg inline-flex justify-start items-center gap-2">
                      <img
                        src="/starknet.png"
                        alt="STRK"
                        className="w-5 h-5 object-contain"
                      />
                      <span className="text-token-strk text-xs font-medium font-sora">
                        STRK
                      </span>
                    </div>
                  </div>

                  {/* Amount display on the right */}
                  <div className="flex-1">
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal font-sora leading-8 sm:leading-9 md:leading-10 text-neutral-800">
                      <NumericFormat
                        displayType="text"
                        value={claimableBig.toString()}
                        thousandSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom row: Already claimed info on right */}
                <div className="flex justify-between items-center">
                  {/* Placeholder for symmetry */}
                  <span className="text-neutral-800 text-sm font-medium font-sora leading-none">
                    {/* Could add USD value here if price feed available */}
                  </span>

                  {/* Already claimed info on bottom right */}
                  <div className="flex items-center gap-1">
                    <span className="text-neutral-800 text-xs font-medium font-sora leading-3">
                      Already claimed:
                    </span>
                    <span className="text-neutral-800 text-base font-medium font-sora leading-none">
                      <NumericFormat
                        displayType="text"
                        value={alreadyClaimedBig.toString()}
                        thousandSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                      />
                    </span>
                    <span className="text-neutral-800 text-xs font-medium font-sora leading-3">
                      STRK
                    </span>
                  </div>
                </div>
              </div>

              {/* Claim Button */}
              <Button
                onClick={handleButtonClick}
                disabled={
                  (address && !hasClaimableRewards) || isSending || isPending
                }
                className="w-full h-12 bg-token-bg-blue hover:bg-blue-600 text-white text-sm font-medium font-sora py-4 px-6 rounded-xl transition-all disabled:opacity-50"
              >
                {!address
                  ? "Connect Wallet"
                  : isSending
                  ? "Confirm in wallet..."
                  : isPending
                  ? "Transaction pending..."
                  : hasClaimableRewards
                  ? `Claim ${claimableBig.toFixed(2)} STRK`
                  : "No Rewards to Claim"}
              </Button>

              {/* Weekly Rewards History */}
              <Card className="rounded-2xl border-0 shadow-none bg-white">
                <CardHeader className="border-b border-[#F5F3EE]">
                  <CardTitle className="text-lg font-medium font-sora text-neutral-800 flex items-center gap-2">
                    Weekly Rewards History
                  </CardTitle>
                </CardHeader>
                <CardContent className="">
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(
                        (weekNumber) => {
                          const dates = getWeekDates(weekNumber);
                          // Find matching data from backend
                          const weekData = roundBreakdown?.rounds?.find(
                            (r: { round: number; amount: Big }) =>
                              r.round === weekNumber
                          );
                          const amount = weekData?.amount || "0";

                          return (
                            <TableRow key={weekNumber}>
                              <TableCell className="font-medium font-sora text-neutral-800">
                                Week {weekNumber}
                              </TableCell>
                              <TableCell className="text-sm font-sora text-neutral-600">
                                {dates.start} - {dates.end}
                              </TableCell>
                              <TableCell className="text-right font-medium font-sora text-neutral-800">
                                <NumericFormat
                                  displayType="text"
                                  value={amount.toString()}
                                  thousandSeparator=","
                                  decimalScale={2}
                                  fixedDecimalScale
                                />{" "}
                                STRK
                              </TableCell>
                            </TableRow>
                          );
                        }
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right Panel - Info */}
        <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:min-w-[320px]">
          <Card className="rounded-2xl border-0 shadow-none bg-white">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg font-medium font-sora text-neutral-800 flex items-center gap-2">
                Your STRK Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-sora text-neutral-700">
                Earn STRK rewards by borrowing USDU. Get 40% of your interest
                back plus 2% of your collateral value annually, paid weekly.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md p-2.5 text-center bg-neutral-50 border border-neutral-200">
                  <div className="text-lg font-medium font-sora text-neutral-800 leading-none">
                    40%
                  </div>
                  <div className="text-[11px] font-sora text-neutral-600 mt-1">
                    Interest Rebate
                  </div>
                </div>
                <div className="rounded-md p-2.5 text-center bg-neutral-50 border border-neutral-200">
                  <div className="text-lg font-medium font-sora text-neutral-800 leading-none">
                    2%
                  </div>
                  <div className="text-[11px] font-sora text-neutral-600 mt-1">
                    Collateral APR
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-5">
                <h4 className="text-xs font-medium font-sora uppercase tracking-tight text-neutral-800 mb-2">
                  Example with $100k BTC
                </h4>
                <div className="rounded-lg p-3 bg-neutral-50 border border-neutral-200">
                  <div className="space-y-1.5 text-xs font-sora">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Collateral</span>
                      <span className="font-medium text-neutral-800">
                        $100,000 BTC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">
                        Borrowed (50% LTV)
                      </span>
                      <span className="font-medium text-neutral-800">
                        $50,000 USDU
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Interest Rate</span>
                      <span className="font-medium text-neutral-800">
                        5% APR ($2,500/yr)
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-neutral-200 space-y-1.5 text-[13px] font-sora">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">
                        Interest Rebate (40%)
                      </span>
                      <span className="font-medium text-neutral-800">
                        $1,000/yr
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">
                        Collateral Rewards (2%)
                      </span>
                      <span className="font-medium text-neutral-800">
                        $2,000/yr
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5">
                      <span className="text-neutral-700 font-medium">
                        Total STRK/Week
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-[11px] font-medium">
                        ~$57.69
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
