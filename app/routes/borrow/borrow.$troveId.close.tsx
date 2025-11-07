import { Button } from "~/components/ui/button";
import { Info } from "lucide-react";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { InfoBox } from "~/components/ui/info-box";
import { ArrowIcon } from "~/components/icons/arrow-icon";
import type { Route } from "./+types/borrow.$troveId.close";
import { useParams, useNavigate } from "react-router";
import { useAccount, useBalance } from "@starknet-react/core";
import { MIN_DEBT } from "~/lib/contracts/constants";
import {
  TOKENS,
  getCollateralByBranchId,
  DEFAULT_COLLATERAL,
} from "~/lib/collateral";
import { extractBranchId } from "~/lib/utils/trove-id";
import { NumericFormat } from "react-number-format";
import { useTroveData } from "~/hooks/use-trove-data";
import { useCloseTrove } from "~/hooks/use-close-trove";
import { useCallback } from "react";
import { useWalletConnect } from "~/hooks/use-wallet-connect";
import { toast } from "sonner";
import {
  Alert,
  AlertIcon,
  AlertDescription,
  AlertContent,
} from "~/components/ui/alert";
import { BorrowingRestrictionsAlert } from "~/components/borrow/borrowing-restrictions-alert";
import { useCollateralPrice, useUsduPrice } from "~/hooks/use-fetch-prices";
import { Skeleton } from "~/components/ui/skeleton";
import Big from "big.js";
import { bigintToBig } from "~/lib/decimal";
import { createMeta } from "~/lib/utils/meta";

function ClosePosition() {
  const { address } = useAccount();
  const { troveId } = useParams();
  const navigate = useNavigate();
  const { connectWallet } = useWalletConnect();

  // Fetch existing trove data
  const { position, isLoading: isTroveLoading } = useTroveData(troveId);

  // Get collateral from position ID
  const branchId = extractBranchId(position?.id);
  const selectedCollateral =
    branchId !== undefined
      ? getCollateralByBranchId(branchId)!
      : DEFAULT_COLLATERAL;

  const { data: usduBalance } = useBalance({
    token: TOKENS.USDU.address,
    address: address,
    refetchInterval: 30000,
  });

  // Fetch prices for display
  const bitcoin = useCollateralPrice(selectedCollateral.id, {
    enabled: !!position,
  });
  const usdu = useUsduPrice({ enabled: !!position });

  const {
    send,
    isPending,
    isSending,
    error: transactionError,
    transactionHash,
    currentState,
    formData,
    reset,
  } = useCloseTrove({
    troveId: position?.id,
    debt: position?.borrowedAmount,
    collateralAmount: position?.collateralAmount,
    collateral: selectedCollateral,
  });

  // Check if user has enough USDU to repay
  const usduBal = usduBalance
    ? bigintToBig(usduBalance.value, TOKENS.USDU.decimals)
    : new Big(0);
  const hasEnoughBalance = position
    ? usduBal.gte(position.borrowedAmount)
    : false;

  // Check trove status
  const isZombie =
    position?.status === "redeemed" && position?.borrowedAmount.lt(MIN_DEBT);
  const isRedeemed = position?.status === "redeemed";

  const handleClosePosition = async () => {
    if (!address) {
      await connectWallet();
      return;
    }

    if (!hasEnoughBalance) {
      toast.error("Insufficient USDU balance to repay debt");
      return;
    }

    try {
      await send();
    } catch (error) {
      console.error("Transaction error:", error);
    }
  };

  const handleComplete = useCallback(() => {
    if (currentState === "error") {
      // Reset for retry
      reset();
    } else {
      // Navigate on success
      navigate("/");
    }
  }, [navigate, currentState, reset]);

  if (isTroveLoading || !position) {
    return (
      <>
        <div className="flex justify-between items-baseline">
          <h1 className="text-3xl font-medium leading-none pb-6 font-sora text-neutral-800">
            Close Position
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left Panel Skeleton */}
          <div className="flex-1 lg:flex-[2] space-y-6">
            {/* Debt Section Skeleton */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <Skeleton className="h-3 w-24 mb-4" />
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-10 w-24 rounded-lg" />
                <div className="flex-1 text-right space-y-2">
                  <Skeleton className="h-7 w-20 ml-auto" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>

            {/* Collateral Section Skeleton */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <Skeleton className="h-3 w-32 mb-4" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-24 rounded-lg" />
                <div className="flex-1 text-right space-y-2">
                  <Skeleton className="h-7 w-24 ml-auto" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              </div>
            </div>

            {/* Button Skeleton */}
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          {/* Right Panel Skeleton */}
          <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:min-w-[320px]">
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between pb-6 lg:pb-8 items-baseline">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]">
          Close Position
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Panel */}
        <div className="flex-1 lg:flex-[2]">
          {["pending", "success", "error"].includes(currentState) ? (
            <TransactionStatus
              transactionHash={transactionHash}
              isError={currentState === "error"}
              isSuccess={currentState === "success"}
              error={
                transactionError ? new Error(transactionError.message) : null
              }
              successTitle="Position Closed!"
              successSubtitle="Your position has been closed and collateral returned."
              details={
                currentState === "success" &&
                formData.debt &&
                formData.collateralAmount
                  ? [
                      {
                        label: "Debt Repaid",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={formData.debt.toString()}
                              thousandSeparator=","
                              decimalScale={2}
                              fixedDecimalScale
                            />{" "}
                            USDU
                          </>
                        ),
                      },
                      {
                        label: "Collateral Returned",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={formData.collateralAmount.toString()}
                              thousandSeparator=","
                              decimalScale={7}
                              fixedDecimalScale={false}
                            />{" "}
                            {formData.collateralSymbol}
                          </>
                        ),
                      },
                    ]
                  : undefined
              }
              onComplete={handleComplete}
              completeButtonText={
                currentState === "error" ? "Try Again" : "Back to Dashboard"
              }
            />
          ) : (
            <div className="space-y-1">
              {/* Borrowing Restrictions Alert */}
              <BorrowingRestrictionsAlert
                collateralType={selectedCollateral.id}
              />

              {/* Special Status Alert */}
              {(isZombie || isRedeemed) && (
                <Alert variant="warning">
                  <AlertIcon variant="warning">
                    <Info className="w-4 h-4 text-[#FF9300]" />
                  </AlertIcon>
                  <AlertContent>
                    <AlertDescription>
                      <strong>
                        {isZombie ? "Zombie Position" : "Redeemed Position"}
                      </strong>
                      <p>
                        {isZombie
                          ? "This position has fallen below the minimum debt threshold. Closing it will return any remaining collateral."
                          : "This position has been partially redeemed."}
                      </p>
                    </AlertDescription>
                  </AlertContent>
                </Alert>
              )}

              {/* Debt Repayment Section */}
              <div className="bg-white rounded-2xl p-6 space-y-6">
                <div className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight">
                  DEBT TO REPAY
                </div>

                {/* Main content area - matching TokenInput style */}
                <div className="flex items-center gap-6">
                  {/* Token selector on the left */}
                  <div className="flex items-center gap-2 p-2.5 bg-token-bg-red/10 rounded-lg">
                    <img
                      src={TOKENS.USDU.icon}
                      alt="USDU"
                      className="w-5 h-5 object-contain"
                    />
                    <span className="text-token-bg-red text-xs font-medium font-sora">
                      USDU
                    </span>
                  </div>

                  {/* Amount on the right */}
                  <div className="flex-1">
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal font-sora text-neutral-800 w-full">
                      <NumericFormat
                        displayType="text"
                        value={position.borrowedAmount.toString()}
                        thousandSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom row: USD value and Balance */}
                <div className="flex justify-between items-center">
                  {/* USD value on left */}
                  <NumericFormat
                    className="text-neutral-800 text-sm font-medium font-sora leading-none"
                    displayType="text"
                    value={position.borrowedAmount
                      .times(usdu?.price || 1)
                      .toString()}
                    prefix="= $"
                    thousandSeparator=","
                    decimalScale={3}
                    fixedDecimalScale
                  />

                  {/* Balance info on right */}
                  <div className="flex items-center gap-1">
                    <span className="text-neutral-800 text-xs font-medium font-sora leading-3">
                      Balance:
                    </span>
                    <NumericFormat
                      className={`text-base font-medium font-sora leading-none ${
                        hasEnoughBalance ? "text-neutral-800" : "text-red-600"
                      }`}
                      displayType="text"
                      value={usduBal.toString()}
                      thousandSeparator=","
                      decimalScale={3}
                      fixedDecimalScale
                    />
                    <span className="text-neutral-800 text-xs font-medium font-sora leading-3">
                      USDU
                    </span>
                    {!hasEnoughBalance && (
                      <span className="text-xs text-red-600 font-medium ml-1">
                        (need{" "}
                        <NumericFormat
                          displayType="text"
                          value={position.borrowedAmount
                            .minus(usduBal)
                            .toString()}
                          thousandSeparator=","
                          decimalScale={2}
                          fixedDecimalScale
                        />{" "}
                        more)
                      </span>
                    )}
                  </div>
                </div>
              </div>

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

              {/* Collateral Return Section */}
              <div className="bg-white rounded-2xl p-6 space-y-6">
                <div className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight">
                  COLLATERAL TO RECEIVE
                </div>

                {/* Main content area - matching TokenInput style */}
                <div className="flex items-center gap-6">
                  {/* Token selector on the left */}
                  <div className="flex items-center gap-2 p-2.5 bg-token-bg rounded-lg">
                    <img
                      src={selectedCollateral.icon}
                      alt={selectedCollateral.symbol}
                      className="w-5 h-5 object-contain"
                    />
                    <span className="text-token-orange text-xs font-medium font-sora">
                      {selectedCollateral.symbol}
                    </span>
                  </div>

                  {/* Amount on the right */}
                  <div className="flex-1">
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal font-sora text-neutral-800 w-full">
                      <NumericFormat
                        displayType="text"
                        value={position.collateralAmount.toString()}
                        thousandSeparator=","
                        decimalScale={7}
                        fixedDecimalScale={false}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom row: USD value */}
                <div className="flex justify-between items-center">
                  <NumericFormat
                    className="text-neutral-800 text-sm font-medium font-sora leading-none"
                    displayType="text"
                    value={position.collateralAmount
                      .times(bitcoin?.price || 0)
                      .toString()}
                    prefix="= $"
                    thousandSeparator=","
                    decimalScale={3}
                    fixedDecimalScale
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col items-start space-y-2 mt-6">
                <Button
                  onClick={handleClosePosition}
                  disabled={
                    (address && !hasEnoughBalance) || isSending || isPending
                  }
                  className="w-full h-12 bg-red-500 hover:bg-red-600 text-white text-sm font-medium font-sora py-4 px-6 rounded-xl transition-all whitespace-nowrap"
                >
                  {!address
                    ? "Connect Wallet"
                    : isSending
                    ? "Confirm in wallet..."
                    : isPending
                    ? "Transaction pending..."
                    : !hasEnoughBalance
                    ? "Insufficient USDU Balance"
                    : "Close Position"}
                </Button>

                {/* Show swap suggestion when insufficient balance */}
                {address && !hasEnoughBalance && (
                  <a
                    href="https://app.avnu.fi/en/usdc-usdu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-left text-neutral-800 text-sm font-normal font-sora hover:opacity-70 transition-opacity cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Not enough USDU.</span>
                    <span className="underline flex items-center gap-1">
                      Swap to get USDU
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        className="inline-block"
                      >
                        <path
                          d="M3 9L9 3M9 3H4.5M9 3V7.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Info Box */}
        <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:min-w-[320px] space-y-4">
          <InfoBox title="About Closing" variant="blue">
            <div className="space-y-3">
              <p className="text-sm font-normal leading-relaxed">
                Closing your position will repay your entire debt and return all
                your collateral.
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li className="text-sm font-normal leading-relaxed">
                  You need{" "}
                  <strong>{position?.borrowedAmount.toFixed(2)} USDU</strong> to
                  repay your debt
                </li>
                <li className="text-sm font-normal leading-relaxed">
                  You will receive back{" "}
                  <strong>
                    {position?.collateralAmount.toFixed(7)}{" "}
                    {selectedCollateral.symbol}
                  </strong>
                </li>
                <li className="text-sm font-normal leading-relaxed">
                  The position will be permanently closed
                </li>
                <li className="text-sm font-normal leading-relaxed">
                  No further interest or fees will accrue
                </li>
              </ul>
              {(isZombie || isRedeemed) && (
                <p className="text-sm font-medium">
                  ⚠️{" "}
                  {isZombie
                    ? "This is a zombie position - closing it will recover your remaining collateral"
                    : "This position has been partially redeemed - check for surplus after closing"}
                </p>
              )}
            </div>
          </InfoBox>
        </div>
      </div>
    </>
  );
}

export default ClosePosition;

export function meta(args: Route.MetaArgs) {
  return createMeta(args, {
    title: "Uncap - Close position",
    description: "Close your USDU borrowing position with Uncap",
  });
}
