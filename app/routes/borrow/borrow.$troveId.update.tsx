import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ArrowDown, AlertTriangle, Info } from "lucide-react";
import { InterestRateSelector } from "~/components/borrow";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { BorrowingRestrictionsAlert } from "~/components/borrow";
import { TokenInput } from "~/components/token-input";
import { useEffect, useCallback } from "react";
import { useForm } from "@tanstack/react-form";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import { MAX_LIMIT, computeDebtLimit } from "~/lib/utils/calc";
import { validators } from "~/lib/validators";
import type { Route } from "./+types/borrow.$troveId.update";
import { useParams, useNavigate } from "react-router";
import { useAccount, useBalance } from "@starknet-react/core";
import {
  USDU_TOKEN,
  UBTC_TOKEN,
  GBTC_TOKEN,
  MIN_DEBT,
} from "~/lib/contracts/constants";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { useTroveData } from "~/hooks/use-trove-data";
import { useUpdatePosition } from "~/hooks/use-update-position";
import { bigintToDecimal } from "~/lib/decimal";
import { useQueryState, parseAsFloat, parseAsInteger } from "nuqs";
import { useWalletConnect } from "~/hooks/use-wallet-connect";
import { getInterestRatePercentage } from "~/lib/utils/position-helpers";
import { extractTroveId } from "~/lib/utils/trove-id";
import { TransactionSummary } from "~/components/transaction-summary";
import {
  usePositionMetrics,
  getRedemptionRisk,
} from "~/hooks/use-position-metrics";
import { getMinCollateralizationRatio } from "~/lib/utils/collateral-config";
import type { CollateralType } from "~/lib/contracts/constants";

function UpdatePosition() {
  const { address } = useAccount();
  const { troveId } = useParams();
  const navigate = useNavigate();
  const { connectWallet } = useWalletConnect();

  // Fetch existing position data
  const { position, isLoading: isPositionLoading } = useTroveData(troveId);

  // Zombie trove detection
  const isZombie = !!(
    position &&
    position.status === "redeemed" &&
    position.borrowedAmount > 0 &&
    position.borrowedAmount < MIN_DEBT
  );
  const isFullyRedeemed = !!(
    position &&
    position.status === "redeemed" &&
    position.borrowedAmount === 0
  );
  const hasBeenRedeemed = !!(position && position.status === "redeemed");

  // Get collateral token based on position
  const selectedCollateralToken =
    position?.collateralAsset === "GBTC" ? GBTC_TOKEN : UBTC_TOKEN;

  // URL state for form inputs
  const [collateralAmount, setCollateralAmount] = useQueryState(
    "amount",
    parseAsFloat.withDefault(position?.collateralAmount || 0)
  );
  const [borrowAmount, setBorrowAmount] = useQueryState(
    "borrow",
    parseAsFloat.withDefault(position?.borrowedAmount || 0)
  );
  const [interestRate, setInterestRate] = useQueryState(
    "rate",
    parseAsInteger.withDefault(
      position ? getInterestRatePercentage(position) : 5
    )
  );
  const collateralType = selectedCollateralToken.symbol as CollateralType;

  // Get rate mode from URL
  const [rateMode] = useQueryState("rateMode", {
    defaultValue: "manual" as const,
  });

  // Balance for selected token
  const { data: bitcoinBalance } = useBalance({
    token: selectedCollateralToken.address,
    address: address,
    refetchInterval: 30000,
  });

  const { data: usduBalance } = useBalance({
    token: USDU_TOKEN.address,
    address: address,
    refetchInterval: 30000,
  });

  const { bitcoin, usdu } = useFetchPrices(
    collateralAmount ?? undefined,
    collateralType
  );

  const minCollateralizationRatio =
    getMinCollateralizationRatio(collateralType);

  const metrics = usePositionMetrics({
    collateralAmount,
    borrowAmount,
    bitcoinPrice: bitcoin?.price,
    usduPrice: usdu?.price,
    minCollateralizationRatio,
  });

  // Initialize form with position values
  const form = useForm({
    defaultValues: {
      collateralAmount: collateralAmount ?? position?.collateralAmount,
      borrowAmount: borrowAmount ?? position?.borrowedAmount,
      interestRate:
        interestRate ?? (position ? getInterestRatePercentage(position) : 5),
    },
    onSubmit: async ({ value }) => {
      if (!isReady) {
        if (!address) {
          toast.error("Please connect your wallet");
        }
        return;
      }

      if (!value.collateralAmount || !value.borrowAmount) {
        return;
      }

      // Check if there are actual changes
      if (
        !changes ||
        (!changes.hasCollateralChange &&
          !changes.hasDebtChange &&
          !changes.hasInterestRateChange)
      ) {
        toast.error("No changes to update");
        return;
      }

      try {
        await send();
      } catch (error) {
        console.error("Transaction error:", error);
      }
    },
  });

  // Update form when position loads
  useEffect(() => {
    if (position && !collateralAmount && !borrowAmount) {
      form.reset({
        collateralAmount: position.collateralAmount,
        borrowAmount: position.borrowedAmount,
        interestRate: getInterestRatePercentage(position),
      });
      setCollateralAmount(position.collateralAmount);
      setBorrowAmount(position.borrowedAmount);
      setInterestRate(getInterestRatePercentage(position));
    }
  }, [position]);

  const {
    send,
    isPending,
    isSending,
    error: transactionError,
    transactionHash,
    isReady,
    currentState,
    formData,
    changes,
  } = useUpdatePosition({
    position,
    collateralAmount: collateralAmount ?? undefined,
    borrowAmount: borrowAmount ?? undefined,
    interestRate: interestRate ?? 5,
    collateralToken: selectedCollateralToken,
  });

  // Revalidate fields when wallet connection changes
  useEffect(() => {
    if (address) {
      if (collateralAmount && collateralAmount > 0) {
        form.validateField("collateralAmount", "change");
      }
      if (borrowAmount && borrowAmount > 0) {
        form.validateField("borrowAmount", "change");
      }
    }
  }, [address]);

  const handleComplete = useCallback(() => {
    navigate("/");
  }, [navigate]);

  if (isPositionLoading || !position) {
    return (
      <>
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">
          Update Position
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Panel Skeleton */}
          <div className="md:col-span-2">
            <Card className="border border-slate-200">
              <CardContent className="pt-6 space-y-6">
                {/* Current Position Info Skeleton */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-3" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex justify-between">
                      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Collateral Input Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
                  <div className="h-12 w-full bg-slate-100 rounded-lg animate-pulse" />
                </div>

                {/* Divider */}
                <div className="h-10 flex items-center justify-center">
                  <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse" />
                </div>

                {/* Debt Input Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                  <div className="h-12 w-full bg-slate-100 rounded-lg animate-pulse" />
                </div>

                {/* Interest Rate Section Skeleton */}
                <div className="space-y-4">
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                  <div className="h-20 w-full bg-slate-100 rounded-lg animate-pulse" />
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="h-4 w-full bg-blue-100 rounded animate-pulse" />
                    <div className="h-3 w-3/4 bg-blue-100 rounded animate-pulse mt-2" />
                  </div>
                </div>

                {/* Button Skeleton */}
                <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse" />
              </CardContent>
            </Card>
          </div>

          {/* Right Panel Skeleton */}
          <div className="md:col-span-1">
            <Card className="border border-slate-200">
              <CardContent className="pt-6 space-y-4">
                <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />

                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">
        Update Position
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Panel */}
        <div className="md:col-span-2">
          {["pending", "success", "error"].includes(currentState) ? (
            <TransactionStatus
              transactionHash={transactionHash}
              isError={currentState === "error"}
              isSuccess={currentState === "success"}
              error={transactionError as Error | null}
              successTitle="Position Updated!"
              successSubtitle="Your position has been updated successfully."
              details={
                changes &&
                formData.collateralAmount &&
                formData.borrowAmount &&
                transactionHash
                  ? ([
                      changes.hasCollateralChange && {
                        label: changes.isCollIncrease
                          ? "Collateral Added"
                          : "Collateral Withdrawn",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={bigintToDecimal(
                                changes.collateralChange,
                                18
                              )}
                              thousandSeparator=","
                              decimalScale={7}
                              fixedDecimalScale={false}
                            />{" "}
                            {selectedCollateralToken.symbol}
                          </>
                        ),
                      },
                      changes.hasDebtChange && {
                        label: changes.isDebtIncrease
                          ? "Borrowed More"
                          : "Debt Repaid",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={bigintToDecimal(changes.debtChange, 18)}
                              thousandSeparator=","
                              decimalScale={2}
                              fixedDecimalScale
                            />{" "}
                            USDU
                          </>
                        ),
                      },
                      {
                        label: "Interest Rate (APR)",
                        value: `${interestRate}%`,
                      },
                    ].filter(Boolean) as any)
                  : undefined
              }
              onComplete={handleComplete}
              completeButtonText="Back to Dashboard"
            />
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              {/* Show borrowing restrictions alert if TCR is below CCR */}
              <BorrowingRestrictionsAlert collateralType={collateralType} />

              {/* Redemption History Alert - Show for all redeemed troves */}
              {hasBeenRedeemed && position && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        Position Has Been Partially Redeemed
                      </h3>
                      <div className="space-y-2 text-sm text-blue-800">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-blue-700">Redemptions: </span>
                            <span className="font-medium">
                              {position.redemptionCount || 0} time
                              {position.redemptionCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div>
                            <span className="text-blue-700">
                              Total Redeemed Debt:{" "}
                            </span>
                            <span className="font-medium">
                              <NumericFormat
                                displayType="text"
                                value={position.redeemedDebt || 0}
                                thousandSeparator=","
                                decimalScale={2}
                                fixedDecimalScale
                              />{" "}
                              USDU
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-blue-700">
                            Total Redeemed Collateral:{" "}
                          </span>
                          <span className="font-medium">
                            <NumericFormat
                              displayType="text"
                              value={position.redeemedColl || 0}
                              thousandSeparator=","
                              decimalScale={7}
                              fixedDecimalScale={false}
                            />{" "}
                            {selectedCollateralToken.symbol}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Zombie Trove Warning - Only for zombie troves */}
              {isZombie && position && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900 mb-2">
                        🧟 Zombie Position - Update Restrictions
                      </h3>
                      <p className="text-sm text-amber-800 mb-3">
                        Your position is below the minimum debt threshold due to
                        redemptions. You have limited options:
                      </p>
                      <ul className="text-sm text-amber-800 space-y-1 ml-4 list-disc">
                        <li>
                          Borrow at least{" "}
                          <span className="font-semibold">
                            {(MIN_DEBT - position.borrowedAmount).toFixed(2)}{" "}
                            USDU
                          </span>{" "}
                          to restore normal status
                        </li>
                        <li>
                          Add or remove collateral (maintaining valid
                          collateralization)
                        </li>
                        <li>Close the position entirely</li>
                      </ul>
                      <div className="mt-3 pt-3 border-t border-amber-200">
                        <p className="text-xs text-amber-700">
                          <strong>Note:</strong> You cannot reduce debt below{" "}
                          {MIN_DEBT} USDU. Interest rate changes are allowed
                          when increasing debt to {MIN_DEBT}+ USDU.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Fully Redeemed Notice */}
              {isFullyRedeemed && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-800 mb-2">
                        Position Fully Redeemed
                      </h3>
                      <p className="text-sm text-yellow-700">
                        Your position has no remaining debt and can be closed to
                        withdraw your collateral.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Card
                className={`border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                  isSending || isPending ? "opacity-75" : ""
                }`}
              >
                <CardContent className="pt-6 space-y-6">
                  {/* Current Position Info */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">
                      Current Position
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Collateral:</span>{" "}
                        <span className="font-medium">
                          <NumericFormat
                            displayType="text"
                            value={position.collateralAmount}
                            thousandSeparator=","
                            decimalScale={7}
                            fixedDecimalScale={false}
                          />{" "}
                          {selectedCollateralToken.symbol}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Debt:</span>{" "}
                        <span className="font-medium">
                          <NumericFormat
                            displayType="text"
                            value={position.borrowedAmount}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />{" "}
                          USDU
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Interest Rate:</span>
                        <span className="font-medium">
                          {position ? getInterestRatePercentage(position) : 0}%
                          APR
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Update Collateral */}
                  <form.Field
                    name="collateralAmount"
                    asyncDebounceMs={300}
                    validators={{
                      onChangeAsync: async ({ value, fieldApi }) => {
                        if (!address || !value) return undefined;

                        if (!bitcoinBalance) return undefined;

                        const balance =
                          Number(bitcoinBalance.value) /
                          10 ** selectedCollateralToken.decimals;
                        const currentCollateral = position.collateralAmount;
                        const currentDebt = position.borrowedAmount;

                        // Check if adding more than balance
                        if (
                          value > currentCollateral &&
                          value - currentCollateral > balance
                        ) {
                          return `Insufficient balance. You have ${balance.toFixed(
                            7
                          )} ${selectedCollateralToken.symbol}`;
                        }

                        // Check minimum collateral ratio after withdrawal
                        if (
                          value < currentCollateral &&
                          bitcoin?.price &&
                          usdu?.price &&
                          currentDebt > 0
                        ) {
                          // Get the current debt value from the form (user's input) or fall back to existing debt
                          const formDebt =
                            fieldApi.form.getFieldValue("borrowAmount");
                          const debtToUse =
                            formDebt !== undefined && formDebt > 0
                              ? formDebt
                              : currentDebt;

                          const newCollateralValue = value * bitcoin.price;
                          console.log("coll value: ", newCollateralValue);
                          const debtValue = debtToUse * usdu.price;
                          console.log("debt value: ", debtValue);
                          const ratioError = validators.minimumCollateralRatio(
                            newCollateralValue,
                            debtValue,
                            minCollateralizationRatio
                          );
                          if (ratioError) return ratioError;
                        }

                        return validators.compose(
                          validators.maximumAmount(value, MAX_LIMIT)
                        );
                      },
                    }}
                    listeners={{
                      onChangeDebounceMs: 500,
                      onChange: ({ fieldApi }) => {
                        const currentBorrowAmount =
                          fieldApi.form.getFieldValue("borrowAmount");
                        if (
                          currentBorrowAmount !== undefined &&
                          currentBorrowAmount > 0
                        ) {
                          fieldApi.form.validateField("borrowAmount", "change");
                        }
                      },
                    }}
                  >
                    {(field) => (
                      <TokenInput
                        token={selectedCollateralToken}
                        balance={bitcoinBalance}
                        price={bitcoin}
                        value={field.state.value}
                        onChange={(value) => {
                          if (value !== undefined) {
                            field.handleChange(value);
                            setCollateralAmount(value);
                          } else {
                            field.handleChange(position?.collateralAmount || 0);
                            setCollateralAmount(
                              position?.collateralAmount || 0
                            );
                          }
                        }}
                        onBlur={field.handleBlur}
                        label="New collateral amount"
                        disabled={isSending || isPending}
                        percentageButtons
                        onPercentageClick={(percentage: number) => {
                          const balance = bitcoinBalance?.value
                            ? Number(bitcoinBalance.value) / 10 ** selectedCollateralToken.decimals
                            : 0;
                          // For update position, Max should be current position + available balance
                          const currentCollateral = position?.collateralAmount || 0;
                          const newValue = percentage === 1 
                            ? currentCollateral + balance  // Max = current + balance
                            : currentCollateral + (balance * percentage); // Others = current + percentage of balance
                          field.handleChange(newValue);
                          setCollateralAmount(newValue);
                        }}
                        includeMax={true}
                      />
                    )}
                  </form.Field>

                  <div className="relative flex justify-center items-center py-3">
                    <div className="w-full h-px bg-slate-200"></div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute bg-white rounded-full border border-slate-200 shadow-sm hover:shadow transition-shadow z-10"
                    >
                      <ArrowDown className="h-4 w-4 text-slate-600" />
                    </Button>
                  </div>

                  {/* Update Debt */}
                  <form.Field
                    name="borrowAmount"
                    asyncDebounceMs={300}
                    validators={{
                      onChangeAsync: async ({ value, fieldApi }) => {
                        if (!value) return undefined;

                        const collateral =
                          fieldApi.form.getFieldValue("collateralAmount");
                        const currentDebt = position.borrowedAmount;
                        const usduBal = usduBalance
                          ? Number(usduBalance.value) /
                            10 ** USDU_TOKEN.decimals
                          : 0;

                        // Check zombie trove restrictions first
                        const zombieError = validators.zombieTroveDebt(
                          value,
                          currentDebt,
                          MIN_DEBT,
                          isZombie
                        );
                        if (zombieError) return zombieError;

                        // Check if repaying more than available balance
                        if (value < currentDebt) {
                          const repayAmount = currentDebt - value;
                          if (repayAmount > usduBal) {
                            return `Insufficient USDU balance. You have ${usduBal.toFixed(
                              2
                            )} USDU`;
                          }
                        }

                        // Don't validate until prices are loaded
                        if (!bitcoin?.price || !usdu?.price) return undefined;

                        // Calculate debt limit with proper collateralization ratio
                        const debtLimit = collateral
                          ? computeDebtLimit(
                              collateral,
                              bitcoin.price,
                              minCollateralizationRatio
                            )
                          : 0;

                        return validators.compose(
                          validators.minimumUsdValue(value, usdu.price, 2000),
                          validators.minimumDebt(value * usdu.price),
                          value > currentDebt
                            ? validators.debtLimit(value, debtLimit)
                            : undefined
                        );
                      },
                    }}
                  >
                    {(field) => (
                      <TokenInput
                        token={USDU_TOKEN}
                        balance={usduBalance}
                        price={usdu}
                        value={field.state.value}
                        onChange={(value) => {
                          if (value !== undefined) {
                            field.handleChange(value);
                            setBorrowAmount(value);
                          } else {
                            field.handleChange(position?.borrowedAmount || 0);
                            setBorrowAmount(position?.borrowedAmount || 0);
                          }
                        }}
                        onBlur={field.handleBlur}
                        label="New debt amount"
                        disabled={isSending || isPending}
                        percentageButtons
                        percentageButtonsOnHover
                        onPercentageClick={(percentage: number) => {
                          // For debt update, percentage represents target LTV
                          const collateral = form.getFieldValue("collateralAmount") || position?.collateralAmount || 0;
                          const btcPrice = bitcoin?.price || 0;
                          const usduPrice = usdu?.price || 1;
                          const collateralValueUSD = collateral * btcPrice;
                          const newDebtUSD = collateralValueUSD * percentage;
                          const newValue = newDebtUSD / usduPrice;
                          field.handleChange(newValue);
                          setBorrowAmount(newValue);
                        }}
                      />
                    )}
                  </form.Field>

                  {/* Interest Rate Section */}
                  <div className="space-y-4">
                    <InterestRateSelector
                      interestRate={interestRate}
                      onInterestRateChange={(rate) => {
                        if (!isSending && !isPending) {
                          form.setFieldValue("interestRate", rate);
                          setInterestRate(rate);
                        }
                      }}
                      disabled={
                        isSending ||
                        isPending ||
                        (isZombie && borrowAmount < MIN_DEBT)
                      }
                      borrowAmount={borrowAmount ?? undefined}
                      collateralType={collateralType}
                      lastInterestRateAdjTime={position?.lastInterestRateAdjTime}
                      currentInterestRate={position ? getInterestRatePercentage(position) : undefined}
                      isZombie={isZombie}
                    />

                    {/* Interest Rate Lock Notice for Zombie Troves */}
                    {isZombie && borrowAmount < MIN_DEBT && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs text-amber-700">
                          <strong>Interest rate is locked</strong> - To change
                          the interest rate, increase your debt to at least{" "}
                          {MIN_DEBT} USDU in the field above.
                        </p>
                      </div>
                    )}

                    {/* Interest Rate Unlock Notice for Zombie Troves restoring debt */}
                    {isZombie && borrowAmount >= MIN_DEBT && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs text-green-700">
                          <strong>Interest rate unlocked!</strong> - You can now
                          change your interest rate since you're restoring debt
                          above {MIN_DEBT} USDU.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Update Button */}
                  <div className="flex flex-col items-start space-y-4 mt-6">
                    <form.Subscribe
                      selector={(state) => ({
                        canSubmit: state.canSubmit,
                        collateralErrors:
                          state.fieldMeta.collateralAmount?.errors || [],
                        borrowErrors:
                          state.fieldMeta.borrowAmount?.errors || [],
                        collateralAmount: state.values.collateralAmount,
                        borrowAmount: state.values.borrowAmount,
                      })}
                    >
                      {({
                        canSubmit,
                        collateralErrors,
                        borrowErrors,
                        collateralAmount,
                        borrowAmount,
                      }) => {
                        let buttonText = "Update Position";

                        if (!address) {
                          buttonText = "Connect Wallet";
                        } else if (
                          !changes ||
                          (!changes.hasCollateralChange &&
                            !changes.hasDebtChange &&
                            !changes.hasInterestRateChange)
                        ) {
                          buttonText = "No changes made";
                        } else if (collateralErrors.length > 0) {
                          buttonText = collateralErrors[0];
                        } else if (borrowErrors.length > 0) {
                          buttonText = borrowErrors[0];
                        } else if (!collateralAmount) {
                          buttonText = "Enter collateral amount";
                        } else if (!borrowAmount) {
                          buttonText = "Enter borrow amount";
                        }

                        return (
                          <Button
                            type={address ? "submit" : "button"}
                            onClick={!address ? connectWallet : undefined}
                            disabled={
                              address &&
                              (!collateralAmount ||
                                !borrowAmount ||
                                borrowAmount <= 0 ||
                                isSending ||
                                isPending ||
                                !canSubmit ||
                                !changes ||
                                (!changes.hasCollateralChange &&
                                  !changes.hasDebtChange &&
                                  !changes.hasInterestRateChange))
                            }
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-6 rounded-xl shadow-sm hover:shadow transition-all whitespace-nowrap"
                          >
                            {isSending
                              ? "Confirm in wallet..."
                              : isPending
                              ? "Transaction pending..."
                              : buttonText}
                          </Button>
                        );
                      }}
                    </form.Subscribe>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}
        </div>

        {/* Right Panel - Transaction Summary */}
        <div className="md:col-span-1">
          <TransactionSummary
            type="update"
            changes={{
              collateral: {
                from: position.collateralAmount,
                to: collateralAmount || position.collateralAmount,
                token: selectedCollateralToken.symbol,
              },
              collateralValueUSD: bitcoin?.price
                ? {
                    from: position.collateralAmount * bitcoin.price,
                    to:
                      (collateralAmount || position.collateralAmount) *
                      bitcoin.price,
                  }
                : undefined,
              debt: {
                from: position.borrowedAmount,
                to: borrowAmount || position.borrowedAmount,
              },
              interestRate: {
                from: getInterestRatePercentage(position),
                to: interestRate || getInterestRatePercentage(position),
              },
            }}
            liquidationPrice={metrics.liquidationPrice}
            liquidationRisk={metrics.liquidationRisk}
            redemptionRisk={getRedemptionRisk(interestRate)}
            warnings={
              borrowAmount && borrowAmount < 2000
                ? ["Minimum debt requirement is $2,000 USDU"]
                : []
            }
            collateralType={position?.collateralAsset as CollateralType}
            troveId={extractTroveId(position?.id)}
            className="sticky top-8"
          />
        </div>
      </div>
    </>
  );
}

export default UpdatePosition;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Update Position - Uncap" },
    { name: "description", content: "Update your Uncap borrowing position" },
  ];
}
