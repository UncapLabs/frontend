import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ArrowDown } from "lucide-react";
import { InterestRateSelector } from "~/components/borrow";
import { TransactionStatus } from "~/components/borrow/transaction-status";
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
} from "~/lib/contracts/constants";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { useTroveData } from "~/hooks/use-trove-data";
import { useUpdatePosition } from "~/hooks/use-update-position";
import { useQueryState, parseAsFloat, parseAsInteger } from "nuqs";
import { useWalletConnect } from "~/hooks/use-wallet-connect";
import { getInterestRatePercentage } from "~/lib/utils/position-helpers";
import { TransactionSummary } from "~/components/transaction-summary";

function UpdatePosition() {
  const { address } = useAccount();
  const { troveId } = useParams();
  const navigate = useNavigate();
  const { connectWallet } = useWalletConnect();
  
  // Fetch existing position data
  const { position, isLoading: isPositionLoading } = useTroveData(troveId);
  
  // Get collateral token based on position
  const selectedCollateralToken = position?.collateralAsset === "GBTC" ? GBTC_TOKEN : UBTC_TOKEN;

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
    parseAsInteger.withDefault(position ? getInterestRatePercentage(position) : 5)
  );

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

  const { bitcoin, usdu } = useFetchPrices(collateralAmount ?? undefined);

  const annualInterestCost = borrowAmount && interestRate ? (borrowAmount * interestRate) / 100 : 0;

  // Calculate metrics for the new position
  const metrics = {
    totalValue: collateralAmount && bitcoin?.price 
      ? collateralAmount * bitcoin.price 
      : 0,
    netValue: collateralAmount && borrowAmount && bitcoin?.price && usdu?.price
      ? (collateralAmount * bitcoin.price) - (borrowAmount * usdu.price)
      : 0,
    liquidationPrice: collateralAmount && borrowAmount && collateralAmount > 0
      ? (borrowAmount * 1.1) / collateralAmount // 110% collateralization
      : 0,
    ltvValue: collateralAmount && borrowAmount && bitcoin?.price && usdu?.price && collateralAmount > 0
      ? (borrowAmount * (usdu?.price || 1)) / (collateralAmount * bitcoin.price) * 100
      : 0,
    collateralRatio: collateralAmount && borrowAmount && bitcoin?.price && usdu?.price && borrowAmount > 0
      ? ((collateralAmount * bitcoin.price) / (borrowAmount * (usdu?.price || 1))) * 100
      : 0,
  };

  // Initialize form with position values
  const form = useForm({
    defaultValues: {
      collateralAmount: collateralAmount ?? position?.collateralAmount,
      borrowAmount: borrowAmount ?? position?.borrowedAmount,
      interestRate: interestRate ?? (position ? getInterestRatePercentage(position) : 5),
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
      if (!changes || (!changes.hasCollateralChange && !changes.hasDebtChange && !changes.hasInterestRateChange)) {
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
                changes && formData.collateralAmount && formData.borrowAmount && transactionHash
                  ? ([
                      changes.hasCollateralChange && {
                        label: changes.isCollIncrease
                          ? "Collateral Added"
                          : "Collateral Withdrawn",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={Number(changes.collateralChange) / 1e18}
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
                              value={Number(changes.debtChange) / 1e18}
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
              <Card
                className={`border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                  isSending || isPending ? "opacity-75" : ""
                }`}
              >
                <CardContent className="pt-6 space-y-6">
                  {/* Current Position Info */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Current Position</h3>
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
                        <span className="font-medium">{position ? getInterestRatePercentage(position) : 0}% APR</span>
                      </div>
                    </div>
                  </div>

                  {/* Update Collateral */}
                  <form.Field
                    name="collateralAmount"
                    asyncDebounceMs={300}
                    validators={{
                      onChangeAsync: async ({ value }) => {
                        if (!address || !value) return undefined;

                        if (!bitcoinBalance) return undefined;

                        const balance = Number(bitcoinBalance.value) / 10 ** selectedCollateralToken.decimals;
                        const currentCollateral = position.collateralAmount;
                        const currentDebt = position.borrowedAmount;

                        // Check if adding more than balance
                        if (value > currentCollateral && value - currentCollateral > balance) {
                          return `Insufficient balance. You have ${balance.toFixed(7)} ${selectedCollateralToken.symbol}`;
                        }

                        // Check minimum collateral ratio after withdrawal
                        if (value < currentCollateral && bitcoin?.price && usdu?.price && currentDebt > 0) {
                          const newCollateralValue = value * bitcoin.price;
                          const debtValue = currentDebt * usdu.price;
                          const ratioError = validators.minimumCollateralRatio(
                            newCollateralValue,
                            debtValue,
                            1.1 // 110% minimum
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
                        const currentBorrowAmount = fieldApi.form.getFieldValue("borrowAmount");
                        if (currentBorrowAmount !== undefined && currentBorrowAmount > 0) {
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
                            setCollateralAmount(position?.collateralAmount || 0);
                          }
                        }}
                        onBlur={field.handleBlur}
                        label="New collateral amount"
                        disabled={isSending || isPending}
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

                        const collateral = fieldApi.form.getFieldValue("collateralAmount");
                        const currentDebt = position.borrowedAmount;
                        const usduBal = usduBalance ? Number(usduBalance.value) / 10 ** USDU_TOKEN.decimals : 0;

                        // Check if repaying more than available balance
                        if (value < currentDebt) {
                          const repayAmount = currentDebt - value;
                          if (repayAmount > usduBal) {
                            return `Insufficient USDU balance. You have ${usduBal.toFixed(2)} USDU`;
                          }
                        }

                        // Don't validate until prices are loaded
                        if (!bitcoin?.price || !usdu?.price) return undefined;

                        // Calculate debt limit
                        const debtLimit = collateral ? computeDebtLimit(collateral, bitcoin.price) : 0;

                        return validators.compose(
                          validators.minimumUsdValue(value, usdu.price, 2000),
                          validators.minimumDebt(value * usdu.price),
                          value > currentDebt ? validators.debtLimit(value, debtLimit) : undefined
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
                      />
                    )}
                  </form.Field>


                  {/* Interest Rate Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-700">Interest Rate</h3>
                    
                    <InterestRateSelector
                      interestRate={interestRate}
                      onInterestRateChange={(rate) => {
                        if (!isSending && !isPending) {
                          form.setFieldValue("interestRate", rate);
                          setInterestRate(rate);
                        }
                      }}
                      disabled={isSending || isPending}
                    />
                    
                    {/* Interest Cost Preview */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-blue-700">Annual Interest Cost:</span>
                        <span className="font-medium text-blue-800">
                          <NumericFormat
                            displayType="text"
                            value={annualInterestCost}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />{" "}
                          USDU/year
                        </span>
                      </div>
                      <p className="text-xs text-blue-600">
                        Higher rates reduce redemption risk. Positions with lower rates are redeemed first.
                      </p>
                    </div>
                  </div>

                  {/* Update Button */}
                  <div className="flex flex-col items-start space-y-4 mt-6">
                    <form.Subscribe
                      selector={(state) => ({
                        canSubmit: state.canSubmit,
                        collateralErrors: state.fieldMeta.collateralAmount?.errors || [],
                        borrowErrors: state.fieldMeta.borrowAmount?.errors || [],
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
                        } else if (!changes || (!changes.hasCollateralChange && !changes.hasDebtChange && !changes.hasInterestRateChange)) {
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
                                (!changes.hasCollateralChange && !changes.hasDebtChange && !changes.hasInterestRateChange))
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
              collateralValueUSD: bitcoin?.price ? {
                from: position.collateralAmount * bitcoin.price,
                to: (collateralAmount || position.collateralAmount) * bitcoin.price,
              } : undefined,
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
            liquidationRisk={
              metrics.liquidationPrice > 0 && bitcoin?.price
                ? bitcoin.price / metrics.liquidationPrice > 2
                  ? "Low"
                  : bitcoin.price / metrics.liquidationPrice > 1.5
                  ? "Medium"
                  : "High"
                : undefined
            }
            redemptionRisk={
              interestRate !== undefined
                ? interestRate < 5
                  ? "High"
                  : interestRate < 10
                  ? "Medium"
                  : "Low"
                : undefined
            }
            warnings={borrowAmount && borrowAmount < 2000 ? ["Minimum debt requirement is $2,000 USDU"] : []}
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