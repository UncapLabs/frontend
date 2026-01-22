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
import {
  useClaimStrk,
  useStrkAlreadyClaimed,
  type StrkOutputToken,
} from "~/hooks/use-claim-strk";
import {
  useStrkClaimCalldata,
  useStrkAllocationAmount,
  useStrkRoundBreakdown,
} from "~/hooks/use-strk-claim";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { TOKENS } from "~/lib/collateral";
import { bigintToBig } from "~/lib/decimal";
import type Big from "big.js";
import { useCallback, useMemo } from "react";
import { useUncapIncentiveRates } from "~/hooks/use-incentive-rates";
import { useQueryState, parseAsStringEnum } from "nuqs";
import { getSlippageForPair } from "~/lib/contracts/avnu";
import { ArrowIcon } from "~/components/icons/arrow-icon";

interface GetStrkButtonTextParams {
  address: string | undefined;
  hasClaimableRewards: boolean;
  outputToken: StrkOutputToken;
  isSending: boolean;
  isPending: boolean;
  isQuoteLoading: boolean;
  quoteError: Error | null;
  claimableAmount: Big | undefined;
}

function getStrkButtonText(params: GetStrkButtonTextParams): string {
  const {
    address,
    hasClaimableRewards,
    outputToken,
    isSending,
    isPending,
    isQuoteLoading,
    quoteError,
    claimableAmount,
  } = params;

  const isSwapping = outputToken !== "STRK";

  if (!address) return "Connect Wallet";
  if (isSending) return "Confirm in wallet...";
  if (isPending) return "Transaction pending...";
  if (isSwapping && isQuoteLoading) return "Fetching swap quote...";
  if (isSwapping && quoteError) return `${outputToken} swap unavailable`;

  if (!hasClaimableRewards) return "No Rewards to Claim";

  return outputToken === "STRK"
    ? `Claim ${claimableAmount?.toFixed(2) ?? "0.00"} STRK`
    : `Claim & Swap to ${outputToken}`;
}

// Helper to get week dates - Week 1 starts Thursday Nov 13, 2025
function getWeekDates(weekNumber: number): { start: string; end: string } {
  const weekStartDate = new Date("2025-11-13");
  const startDate = new Date(weekStartDate);
  startDate.setDate(weekStartDate.getDate() + (weekNumber - 1) * 7);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // 6 days later for Thursday-Wednesday week

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
}

// Token options for the selector
const OUTPUT_TOKEN_OPTIONS: {
  value: StrkOutputToken;
  label: string;
  icon: string;
  bgColor: string;
  textColor: string;
}[] = [
  {
    value: "STRK",
    label: "STRK",
    icon: "/starknet.png",
    bgColor: "bg-token-bg-strk/10",
    textColor: "text-token-strk",
  },
  {
    value: "USDU",
    label: "USDU",
    icon: "/usdu.png",
    bgColor: "bg-token-bg-red/10",
    textColor: "text-token-bg-red",
  },
  {
    value: "WBTC",
    label: "WBTC",
    icon: "/wbtc.png",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-600",
  },
];

export function STRKRewardsCard() {
  const { address } = useAccount();
  const { connectWallet } = useWalletConnect();

  // Output token selection state (URL parameter)
  const [outputToken, setOutputToken] = useQueryState(
    "output",
    parseAsStringEnum<StrkOutputToken>(["STRK", "USDU", "WBTC"]).withDefault(
      "STRK"
    )
  );

  // Fetch dynamic incentive rates with fallbacks
  const { data: rates } = useUncapIncentiveRates();
  const borrowRatePercent = (rates?.borrowRate ?? 0.4) * 100; // Fallback: 40%
  // Use WBTC rate as default for general display (most common collateral)
  const supplyRatePercent = (rates?.supplyRates?.WWBTC ?? 0.02) * 100;

  // Fetch data from hooks - all return Big from TRPC
  const { alreadyClaimed, refetch: refetchClaimed } = useStrkAlreadyClaimed();

  const { data: allocationData, refetch: refetchAllocation } =
    useStrkAllocationAmount();

  const { data: calldataResponse, refetch: refetchCalldata } =
    useStrkClaimCalldata();

  const { data: roundBreakdown } = useStrkRoundBreakdown();

  // Calculate claimable amount: cumulative - alreadyClaimed (all in Big)
  const claimableAmount = useMemo(() => {
    // Use calldata amount (cumulative) if available, otherwise fallback to allocation
    const cumulativeAmount = calldataResponse?.amount ?? allocationData;

    if (!cumulativeAmount) return undefined;
    if (!alreadyClaimed) return cumulativeAmount;

    try {
      const remaining = cumulativeAmount.minus(alreadyClaimed);
      return remaining.gt(0) ? remaining : undefined;
    } catch {
      return undefined;
    }
  }, [calldataResponse?.amount, allocationData, alreadyClaimed]);

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
    expectedOutputAmount,
    isQuoteLoading,
    quoteError,
  } = useClaimStrk({
    cumulativeAmount: calldataResponse?.amount, // Cumulative for contract
    claimableAmount, // Actual claimed amount for display
    proof: calldataResponse?.proof,
    outputToken,
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

  // Get the buy token for displaying expected amount
  const buyToken =
    outputToken === "USDU"
      ? TOKENS.USDU
      : outputToken === "WBTC"
      ? TOKENS.WBTC
      : TOKENS.STRK;

  // Get slippage for display
  const slippagePercent =
    outputToken !== "STRK"
      ? (getSlippageForPair("STRK", buyToken.symbol) * 100).toFixed(1)
      : null;

  const hasClaimableRewards = claimableAmount ? claimableAmount.gt(0) : false;

  const handleComplete = useCallback(() => {
    reset();
  }, [reset]);

  const handleButtonClick = async (): Promise<void> => {
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

  return (
    <>
      <div className="flex justify-between pb-6 items-baseline">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]">
          BTCFi Season Rewards
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
              successTitle={
                formData.outputToken && formData.outputToken !== "STRK"
                  ? `Claimed & Swapped to ${formData.outputToken}!`
                  : "STRK Claimed Successfully!"
              }
              successSubtitle={
                formData.outputToken && formData.outputToken !== "STRK"
                  ? `Your STRK rewards have been swapped to ${formData.outputToken} and sent to your wallet.`
                  : "Your STRK rewards have been claimed and sent to your wallet."
              }
              details={
                currentState === "success" && formData.amount
                  ? [
                      {
                        label: "STRK Claimed",
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
                      ...(formData.outputToken &&
                      formData.outputToken !== "STRK" &&
                      formData.expectedOutputAmount
                        ? [
                            {
                              label: "You Received",
                              value: (
                                <>
                                  <NumericFormat
                                    displayType="text"
                                    value={bigintToBig(
                                      BigInt(formData.expectedOutputAmount),
                                      formData.outputToken === "USDU" ? 18 : 8
                                    ).toString()}
                                    thousandSeparator=","
                                    decimalScale={
                                      formData.outputToken === "USDU" ? 2 : 6
                                    }
                                    fixedDecimalScale
                                  />{" "}
                                  {formData.outputToken}
                                </>
                              ),
                            },
                          ]
                        : []),
                    ]
                  : undefined
              }
              onComplete={handleComplete}
              completeButtonText={
                currentState === "error" ? "Try Again" : "Done"
              }
            />
          ) : (
            <>
            <div className="space-y-1">
              {/* Rewards Claim Card - "From" section */}
              <div className="bg-white rounded-2xl p-6 space-y-6">
                {/* Label */}
                <div className="flex justify-between items-start">
                  <label className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight">
                    Available to Claim
                  </label>
                </div>

                {/* Main content area - exactly like TokenInput */}
                <div className="flex items-center gap-6">
                  {/* Token display on the left */}
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
                        value={claimableAmount?.toString() ?? "0"}
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
                        value={alreadyClaimed?.toString() ?? "0"}
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

              {/* Arrow connecting the two sections */}
              <div className="relative flex justify-center items-center">
                <div className="absolute z-10">
                  <ArrowIcon
                    size={40}
                    className="sm:w-12 sm:h-12 md:w-20 md:h-20"
                    innerCircleColor="#242424"
                    direction="down"
                  />
                </div>
              </div>

              {/* Output Token Selection Card - "To" section */}
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <label className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight">
                    You Receive
                  </label>
                </div>

                {/* Main content area with token selector and amount */}
                <div className="flex items-center gap-6">
                  {/* Token selector on the left */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      {OUTPUT_TOKEN_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setOutputToken(option.value)}
                          disabled={isSending || isPending}
                          className={`p-2.5 rounded-lg inline-flex justify-start items-center gap-2 transition-all border-2 ${
                            outputToken === option.value
                              ? `${option.bgColor} border-current ${option.textColor}`
                              : "bg-neutral-50 border-transparent hover:bg-neutral-100"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <img
                            src={option.icon}
                            alt={option.label}
                            className="w-5 h-5 object-contain"
                          />
                          <span
                            className={`text-xs font-medium font-sora ${
                              outputToken === option.value
                                ? option.textColor
                                : "text-neutral-600"
                            }`}
                          >
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount display on the right */}
                  <div className="flex-1">
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal font-sora leading-8 sm:leading-9 md:leading-10 text-neutral-800">
                      {outputToken === "STRK" ? (
                        <NumericFormat
                          displayType="text"
                          value={claimableAmount?.toString() ?? "0"}
                          thousandSeparator=","
                          decimalScale={2}
                          fixedDecimalScale
                        />
                      ) : isQuoteLoading ? (
                        <span className="text-neutral-400">...</span>
                      ) : quoteError ? (
                        <span className="text-red-400 text-lg">
                          Unavailable
                        </span>
                      ) : expectedOutputAmount ? (
                        <NumericFormat
                          displayType="text"
                          value={bigintToBig(
                            expectedOutputAmount,
                            buyToken.decimals
                          ).toString()}
                          thousandSeparator=","
                          decimalScale={buyToken.decimals === 18 ? 2 : 6}
                          fixedDecimalScale
                        />
                      ) : (
                        <span className="text-neutral-400">0.00</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom row: swap info */}
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 text-xs font-sora">
                    {outputToken !== "STRK" && !quoteError && (
                      <>Powered by Avnu</>
                    )}
                  </span>
                  {outputToken !== "STRK" && slippagePercent && !quoteError && (
                    <span className="text-neutral-500 text-xs font-sora">
                      Max slippage: {slippagePercent}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Claim Button */}
            <Button
              onClick={handleButtonClick}
              disabled={
                (address && !hasClaimableRewards) ||
                isSending ||
                isPending ||
                (outputToken !== "STRK" && isQuoteLoading) ||
                (outputToken !== "STRK" && !!quoteError)
              }
              className="w-full h-12 mt-6 mb-6 bg-token-bg-blue hover:bg-blue-600 text-white text-sm font-medium font-sora py-4 px-6 rounded-xl transition-all disabled:opacity-50"
            >
              {getStrkButtonText({
                address,
                hasClaimableRewards,
                outputToken,
                isSending,
                isPending,
                isQuoteLoading,
                quoteError,
                claimableAmount,
              })}
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
            </>
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
                Earn STRK rewards by borrowing USDU. Get up to{" "}
                {borrowRatePercent}% of your interest back plus up to{" "}
                {supplyRatePercent}% of your collateral value annually, paid
                weekly.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md p-2.5 text-center bg-neutral-50 border border-neutral-200">
                  <div className="text-lg font-medium font-sora text-neutral-800 leading-none">
                    {borrowRatePercent}%
                  </div>
                  <div className="text-[11px] font-sora text-neutral-600 mt-1">
                    Interest Rebate
                  </div>
                </div>
                <div className="rounded-md p-2.5 text-center bg-neutral-50 border border-neutral-200">
                  <div className="text-lg font-medium font-sora text-neutral-800 leading-none">
                    {supplyRatePercent}%
                  </div>
                  <div className="text-[11px] font-sora text-neutral-600 mt-1">
                    Collateral APR
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-neutral-500 font-sora italic mt-2">
                * Rates are subject to change
              </p>

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
                        Interest Rebate ({borrowRatePercent}%)
                      </span>
                      <span className="font-medium text-neutral-800">
                        $1,000/yr
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">
                        Collateral Rewards ({supplyRatePercent}%)
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
