import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ArrowDown } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { InterestRateSelector } from "~/components/borrow";
import { RedemptionInfo } from "~/components/borrow/redemption-info";
import { BorrowingRestrictionsAlert } from "~/components/borrow";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { TransactionSummary } from "~/components/transaction-summary";
import { TokenInput } from "~/components/token-input";
import { useEffect, useCallback, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import { MAX_LIMIT, computeDebtLimit } from "~/lib/utils/calc";
import { validators } from "~/lib/validators";
import type { Route } from "./+types/borrow";
import { useAccount, useBalance } from "@starknet-react/core";
import {
  USDU_TOKEN,
  COLLATERAL_TOKENS,
  UBTC_TOKEN,
} from "~/lib/contracts/constants";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { useBorrow } from "~/hooks/use-borrow";
import { useQueryState, parseAsFloat, parseAsInteger } from "nuqs";
import { useWalletConnect } from "~/hooks/use-wallet-connect";
import { useCollateralToken } from "~/hooks/use-collateral-token";
import {
  usePositionMetrics,
  getRedemptionRisk,
} from "~/hooks/use-position-metrics";
import { getMinCollateralizationRatio } from "~/lib/utils/collateral-config";
import type { CollateralType } from "~/lib/contracts/constants";

function Borrow() {
  const { address } = useAccount();
  const { connectWallet } = useWalletConnect();

  // URL state for form inputs with built-in parsers
  const [collateralAmount, setCollateralAmount] = useQueryState(
    "amount",
    parseAsFloat
  );
  const [borrowAmount, setBorrowAmount] = useQueryState("borrow", parseAsFloat);
  const [interestRate, setInterestRate] = useQueryState(
    "rate",
    parseAsInteger.withDefault(5)
  );
  const [selectedTokenAddress, setSelectedTokenAddress] =
    useQueryState("collateral");
  const { selectedCollateralToken } = useCollateralToken(
    selectedTokenAddress || UBTC_TOKEN.address
  );

  // Balance for selected token
  const { data: bitcoinBalance } = useBalance({
    token: selectedCollateralToken.address,
    address: address,
    refetchInterval: 30000,
  });

  const collateralType = selectedCollateralToken.symbol as CollateralType;

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

  // Initialize form with URL values
  const form = useForm({
    defaultValues: {
      collateralAmount: collateralAmount ?? (undefined as number | undefined),
      borrowAmount: borrowAmount ?? (undefined as number | undefined),
      interestRate: interestRate ?? 5,
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

      try {
        await send();
      } catch (error) {
        console.error("Transaction error:", error);
      }
    },
  });

  const {
    send,
    isPending,
    isSending,
    error: transactionError,
    transactionHash,
    isReady,
    currentState,
    formData,
    reset,
  } = useBorrow({
    collateralAmount: collateralAmount ?? undefined,
    borrowAmount: borrowAmount ?? undefined,
    interestRate: interestRate ?? 5,
    collateralToken: selectedCollateralToken,
  });

  // Revalidate fields when wallet connection changes
  useEffect(() => {
    // Only run validation if wallet just connected (not on disconnect)
    if (address) {
      // Validate collateral if user has entered a value
      if (collateralAmount && collateralAmount > 0) {
        form.validateField("collateralAmount", "change");
      }
      // Validate borrow amount if user has entered a value
      if (borrowAmount && borrowAmount > 0) {
        form.validateField("borrowAmount", "change");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]); // Intentionally only re-run when wallet connection changes

  const handlePercentageClick = useCallback(
    (percentage: number, type: "collateral" | "borrow") => {
      if (type === "collateral") {
        const balance = bitcoinBalance?.value
          ? Number(bitcoinBalance.value) /
            10 ** selectedCollateralToken.decimals
          : 0;
        const newValue = balance * percentage;
        form.setFieldValue("collateralAmount", newValue);
        // Manually trigger validation after setting value
        form.validateField("collateralAmount", "change");
      } else {
        // Calculate debt limit inline with proper collateralization ratio
        const collateral = form.getFieldValue("collateralAmount") || 0;
        const btcPrice = bitcoin?.price || 0;
        const maxBorrowable = computeDebtLimit(
          collateral,
          btcPrice,
          minCollateralizationRatio
        );
        const newValue = maxBorrowable * percentage;
        form.setFieldValue("borrowAmount", newValue);
        // Manually trigger validation after setting value
        form.validateField("borrowAmount", "change");
      }
    },
    [
      bitcoinBalance?.value,
      selectedCollateralToken.decimals,
      bitcoin?.price,
      form,
      minCollateralizationRatio,
    ]
  );

  // Stable callbacks for percentage clicks
  const handleCollateralPercentageClick = useCallback(
    (percentage: number) => handlePercentageClick(percentage, "collateral"),
    [handlePercentageClick]
  );

  const handleBorrowPercentageClick = useCallback(
    (percentage: number) => handlePercentageClick(percentage, "borrow"),
    [handlePercentageClick]
  );

  const handleNewBorrow = useCallback(() => {
    form.reset();
    reset(); // Reset transaction state
    setBorrowAmount(null);
    setCollateralAmount(null);
    setInterestRate(5);
  }, [form, reset, setBorrowAmount, setCollateralAmount, setInterestRate]);

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <h1 className="text-3xl font-bold mb-2 text-slate-800">Borrow</h1>
      </div>
      <Separator className="mb-8 bg-slate-200" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Panel */}
        <div className="md:col-span-2">
          {["pending", "success", "error"].includes(currentState) ? (
            <TransactionStatus
              transactionHash={transactionHash}
              isError={currentState === "error"}
              isSuccess={currentState === "success"}
              error={transactionError as Error | null}
              successTitle="Borrow Successful!"
              successSubtitle="Your position has been created successfully."
              details={
                formData.collateralAmount &&
                formData.borrowAmount &&
                transactionHash
                  ? [
                      {
                        label: "Collateral Deposited",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={formData.collateralAmount}
                              thousandSeparator=","
                              decimalScale={7}
                              fixedDecimalScale={false}
                            />{" "}
                            {selectedCollateralToken.symbol}
                          </>
                        ),
                      },
                      {
                        label: "Amount Borrowed",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={formData.borrowAmount}
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
                    ]
                  : undefined
              }
              onComplete={handleNewBorrow}
              completeButtonText="Create New Position"
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

              <Card
                className={`border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                  isSending || isPending ? "opacity-75" : ""
                }`}
              >
                <CardContent className="pt-6 space-y-6">
                  {/* Deposit Collateral Section */}
                  <form.Field
                    name="collateralAmount"
                    asyncDebounceMs={300}
                    validators={{
                      onChangeAsync: async ({ value }) => {
                        if (!address || !value) return undefined;

                        // Don't validate balance until it's loaded
                        if (!bitcoinBalance) return undefined;

                        const balance =
                          Number(bitcoinBalance.value) /
                          10 ** selectedCollateralToken.decimals;

                        return validators.compose(
                          validators.insufficientBalance(value, balance),
                          validators.maximumAmount(value, MAX_LIMIT)
                        );
                      },
                    }}
                    listeners={{
                      onChangeDebounceMs: 500,
                      onChange: ({ fieldApi }) => {
                        // When collateral changes, revalidate borrow amount
                        // This ensures LTV and debt limit checks are re-run
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
                        tokens={COLLATERAL_TOKENS}
                        onTokenChange={(token) => {
                          setSelectedTokenAddress(token.address);
                          // Reset amount when token changes
                          field.handleChange(undefined as number | undefined);
                        }}
                        balance={bitcoinBalance}
                        price={bitcoin}
                        value={field.state.value}
                        onChange={(value) => {
                          field.handleChange(value);
                          // Update URL
                          setCollateralAmount(value || null);
                        }}
                        onBlur={field.handleBlur}
                        label="You deposit"
                        percentageButtons
                        onPercentageClick={handleCollateralPercentageClick}
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

                  {/* Borrow Stablecoin Section */}
                  <form.Field
                    name="borrowAmount"
                    asyncDebounceMs={300}
                    validators={{
                      onChangeAsync: async ({ value, fieldApi }) => {
                        if (!value) return undefined;

                        const collateral =
                          fieldApi.form.getFieldValue("collateralAmount");

                        // Don't validate until prices are loaded
                        if (!bitcoin?.price || !usdu?.price) return undefined;

                        // Calculate debt limit inline with proper collateralization ratio
                        const debtLimit = collateral
                          ? computeDebtLimit(
                              collateral,
                              bitcoin.price,
                              minCollateralizationRatio
                            )
                          : 0;

                        return validators.compose(
                          validators.requiresCollateral(value, collateral),
                          validators.minimumUsdValue(value, usdu.price, 2000),
                          validators.debtLimit(value, debtLimit),
                          // LTV check
                          (() => {
                            if (!collateral) return undefined;
                            const collateralValue = collateral * bitcoin.price;
                            const borrowValue = value * usdu.price;
                            const maxLtvPercent =
                              (1 / minCollateralizationRatio) * 100;
                            return validators.ltvRatio(
                              borrowValue,
                              collateralValue,
                              maxLtvPercent
                            );
                          })()
                        );
                      },
                    }}
                  >
                    {(field) => (
                      <TokenInput
                        token={USDU_TOKEN}
                        price={usdu}
                        value={field.state.value}
                        onChange={(value) => {
                          field.handleChange(value);
                          // Update URL
                          setBorrowAmount(value || null);
                        }}
                        onBlur={field.handleBlur}
                        label="You borrow"
                        percentageButtons
                        percentageButtonsOnHover
                        onPercentageClick={handleBorrowPercentageClick}
                        disabled={isSending || isPending}
                        showBalance={false}
                      />
                    )}
                  </form.Field>

                  {/* Interest Rate Options */}
                  <InterestRateSelector
                    interestRate={interestRate}
                    onInterestRateChange={(rate) => {
                      if (!isSending && !isPending) {
                        form.setFieldValue("interestRate", rate);
                        // Update URL
                        setInterestRate(rate);
                      }
                    }}
                    disabled={isSending || isPending}
                    borrowAmount={borrowAmount ?? undefined}
                    collateralType={collateralType}
                  />

                  {/* Borrow Button */}
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
                        // Button text logic localized to Subscribe
                        let buttonText = "Borrow";

                        if (!address) {
                          buttonText = "Connect Wallet";
                        } else if (collateralErrors.length > 0) {
                          buttonText = collateralErrors[0];
                        } else if (borrowErrors.length > 0) {
                          buttonText = borrowErrors[0];
                        } else if (!collateralAmount) {
                          buttonText = "Deposit collateral";
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
                                !canSubmit)
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
        <div className="lg:col-span-1 space-y-4">
          <TransactionSummary
            type="open"
            changes={{
              collateral: {
                to: collateralAmount || 0,
                token: selectedCollateralToken.symbol,
              },
              collateralValueUSD: {
                to: (collateralAmount || 0) * (bitcoin?.price || 0),
              },
              debt: {
                to: borrowAmount || 0,
              },
              interestRate: {
                to: interestRate || 5,
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
            className="sticky top-8"
          />
          <RedemptionInfo
            variant="inline"
            className="sticky top-[calc(8rem+350px)]"
          />
        </div>
      </div>
    </div>
  );
}

export default Borrow;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Uncap" },
    { name: "This is Uncap", content: "Welcome to Uncap!" },
  ];
}
