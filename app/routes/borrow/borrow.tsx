import { Button } from "~/components/ui/button";
import { InterestRateSelector } from "~/components/borrow/interest-rate-selector";
import { RedemptionInfo } from "~/components/borrow/redemption-info";
import { BorrowingRestrictionsAlert } from "~/components/borrow/borrowing-restrictions-alert";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { TransactionSummary } from "~/components/transaction-summary";
import { TokenInput } from "~/components/token-input";
import { ArrowIcon } from "~/components/icons/arrow-icon";
import { FloatingInfoButton } from "~/components/floating-info-button";
import { useEffect, useCallback } from "react";
import { useForm } from "@tanstack/react-form";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import { computeDebtLimit } from "~/lib/utils/calc";
import { MAX_LIMIT } from "~/lib/contracts/constants";
import { validators } from "~/lib/validators";
import type { Route } from "./+types/borrow";
import { useAccount, useBalance } from "@starknet-react/core";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { useBorrow } from "~/hooks/use-borrow";
import { useQueryState } from "nuqs";
import { parseAsBig, parseAsBigWithDefault } from "~/lib/url-parsers";
import Big from "big.js";
import { bigintToBig } from "~/lib/decimal";
import { calculatePercentageAmountBig } from "~/lib/input-parsers";
import { useWalletConnect } from "~/hooks/use-wallet-connect";
import { usePositionMetrics } from "~/hooks/use-position-metrics";
import {
  TOKENS,
  COLLATERAL_LIST,
  DEFAULT_COLLATERAL,
  getCollateralByAddress,
} from "~/lib/collateral";
import {
  getBalanceDecimals,
  getBalanceTokenAddress,
} from "~/lib/collateral/wrapping";
import { createMeta } from "~/lib/utils/meta";

function Borrow() {
  const { address } = useAccount();
  const { connectWallet } = useWalletConnect();

  // URL state for form inputs
  const [collateralAmount, setCollateralAmount] = useQueryState(
    "amount",
    parseAsBig
  );
  const [borrowAmount, setBorrowAmount] = useQueryState("borrow", parseAsBig);
  const [interestRate, setInterestRate] = useQueryState(
    "rate",
    parseAsBigWithDefault("2.5")
  );
  const [selectedTokenAddress, setSelectedTokenAddress] =
    useQueryState("collateral");

  // Get the collateral based on the address in URL or use default
  const collateral =
    getCollateralByAddress(selectedTokenAddress || "") || DEFAULT_COLLATERAL;

  // Get balance token address and decimals
  const balanceTokenAddress = getBalanceTokenAddress(collateral);

  const { data: bitcoinBalance } = useBalance({
    token: balanceTokenAddress,
    address: address,
    refetchInterval: 30000,
  });

  const { bitcoin, usdu } = useFetchPrices({
    collateralType: collateral.id,
    enabled:
      (collateralAmount !== null &&
        collateralAmount !== undefined &&
        collateralAmount.gt(0)) ||
      (borrowAmount !== null &&
        borrowAmount !== undefined &&
        borrowAmount.gt(0)),
  });
  const minCollateralizationRatio = collateral.minCollateralizationRatio;

  const metrics = usePositionMetrics({
    collateralAmount: collateralAmount,
    borrowAmount: borrowAmount,
    bitcoinPrice: bitcoin?.price,
    usduPrice: usdu?.price,
    minCollateralizationRatio,
  });

  const form = useForm({
    defaultValues: {
      collateralAmount: undefined as Big | undefined,
      borrowAmount: undefined as Big | undefined,
      interestRate: new Big("5"),
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
    interestRate: interestRate ?? new Big("5"),
    collateral: collateral,
  });

  // Revalidate fields when wallet connection changes
  useEffect(() => {
    // Only run validation if wallet just connected (not on disconnect)
    if (address) {
      // Validate collateral if user has entered a value
      if (collateralAmount && collateralAmount.gt(0)) {
        form.validateField("collateralAmount", "change");
      }
      // Validate borrow amount if user has entered a value
      if (borrowAmount && borrowAmount.gt(0)) {
        form.validateField("borrowAmount", "change");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]); // Intentionally only re-run when wallet connection changes

  const handlePercentageClick = useCallback(
    (percentage: number, type: "collateral" | "borrow") => {
      if (type === "collateral") {
        if (!bitcoinBalance?.value) {
          setCollateralAmount(null);
          form.setFieldValue("collateralAmount", undefined);
          return;
        }

        // Use balance decimals for the token
        const balanceDecimals = getBalanceDecimals(collateral);
        const newValue = calculatePercentageAmountBig(
          bitcoinBalance.value,
          balanceDecimals,
          percentage * 100 // Convert to 0-100 scale
        );
        setCollateralAmount(newValue);
        form.setFieldValue("collateralAmount", newValue);
        // Manually trigger validation after setting value
        form.validateField("collateralAmount", "change");
      } else {
        // For borrow, percentage represents LTV (Loan-to-Value)
        // If collateral is worth $100k and user clicks 50%, they want to borrow $50k
        const currentCollateral = collateralAmount ?? undefined;
        if (!currentCollateral) {
          setBorrowAmount(null);
          form.setFieldValue("borrowAmount", undefined);
          return;
        }

        const btcPrice = bitcoin?.price || new Big(0);
        const usduPrice = usdu?.price || new Big(1);

        const collateralValueUSD = currentCollateral.times(btcPrice);
        const borrowAmountUSD = collateralValueUSD.times(percentage);
        const newValue = borrowAmountUSD.div(usduPrice);

        setBorrowAmount(newValue);
        form.setFieldValue("borrowAmount", newValue);
        // Manually trigger validation after setting value
        form.validateField("borrowAmount", "change");
      }
    },
    [
      bitcoinBalance?.value,
      collateral,
      bitcoin?.price,
      usdu?.price,
      form,
      collateralAmount,
      setCollateralAmount,
      setBorrowAmount,
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
    setInterestRate(new Big("5"));
  }, [form, reset, setBorrowAmount, setCollateralAmount, setInterestRate]);

  return (
    <>
      <FloatingInfoButton />
      <div className="w-full mx-auto max-w-7xl py-8 lg:py-12 px-4 sm:px-6 lg:px-8 pb-32">
        <div className="flex justify-between pb-6 lg:pb-8 items-baseline">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]">
            Borrow
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
                                value={formData.collateralAmount.toString()}
                                thousandSeparator=","
                                decimalScale={7}
                                fixedDecimalScale={false}
                              />{" "}
                              {collateral.symbol}
                            </>
                          ),
                        },
                        {
                          label: "Amount Borrowed",
                          value: (
                            <>
                              <NumericFormat
                                displayType="text"
                                value={formData.borrowAmount.toString()}
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
                          value: `${formData.interestRate.toString()}%`,
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
                <BorrowingRestrictionsAlert collateralType={collateral.id} />

                <div
                  className={`space-y-1 ${
                    isSending || isPending ? "opacity-75" : ""
                  }`}
                >
                  {/* Deposit Collateral Section */}
                  <form.Field
                    name="collateralAmount"
                    asyncDebounceMs={300}
                    validators={{
                      onChangeAsync: async ({ value }) => {
                        if (!address || !value) return undefined;

                        // Don't validate balance until it's loaded
                        if (!bitcoinBalance) return undefined;

                        // Convert balance to Big for precise comparison
                        const balance = bigintToBig(
                          bitcoinBalance.value,
                          getBalanceDecimals(collateral)
                        );

                        return validators.compose(
                          validators.insufficientBalance(value, balance),
                          validators.maximumAmount(value, new Big(MAX_LIMIT))
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
                          currentBorrowAmount.gt(0)
                        ) {
                          fieldApi.form.validateField("borrowAmount", "change");
                        }
                      },
                    }}
                  >
                    {(field) => (
                      <TokenInput
                        token={collateral}
                        tokens={COLLATERAL_LIST}
                        onTokenChange={(newToken) => {
                          // Cast back to Collateral since we know these are collaterals
                          const newCollateral = newToken as any;
                          setSelectedTokenAddress(
                            newCollateral.addresses
                              ? newCollateral.addresses.token
                              : newCollateral.address
                          );
                          // Reset amount when token changes
                          field.handleChange(undefined);
                        }}
                        balance={bitcoinBalance}
                        price={bitcoin}
                        value={collateralAmount ?? undefined}
                        onChange={(value) => {
                          // Update URL state directly - nuqs updates React state instantly
                          setCollateralAmount(value ?? null);
                          // Also update form for validation
                          field.handleChange(value);
                        }}
                        onBlur={field.handleBlur}
                        label="Deposit Amount"
                        percentageButtons
                        onPercentageClick={handleCollateralPercentageClick}
                        disabled={isSending || isPending}
                        includeMax={true}
                        tokenSelectorBgColor="bg-token-bg"
                        tokenSelectorTextColor="text-token-orange"
                      />
                    )}
                  </form.Field>

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
                        const debtLimit =
                          collateral && bitcoin?.price
                            ? computeDebtLimit(
                                collateral,
                                bitcoin.price,
                                minCollateralizationRatio
                              )
                            : new Big(0);

                        return validators.compose(
                          validators.requiresCollateral(value, collateral),
                          validators.minimumUsdValue(
                            value,
                            usdu.price,
                            new Big(200)
                          ),
                          validators.debtLimit(value, debtLimit),
                          // LTV check
                          (() => {
                            if (!collateral) return undefined;
                            const collateralValue = collateral.times(
                              bitcoin.price
                            );
                            const borrowValue = value.times(usdu.price);
                            const maxLtvPercent = new Big(1)
                              .div(minCollateralizationRatio)
                              .times(100);
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
                        token={TOKENS.USDU}
                        price={usdu}
                        value={borrowAmount ?? undefined}
                        onChange={(value) => {
                          // Update URL state directly - nuqs updates React state instantly
                          setBorrowAmount(value ?? null);
                          // Also update form for validation
                          field.handleChange(value);
                        }}
                        onBlur={field.handleBlur}
                        label="Borrow Amount"
                        percentageButtons
                        onPercentageClick={handleBorrowPercentageClick}
                        disabled={isSending || isPending}
                        showBalance={false}
                        tokenSelectorBgColor="bg-token-bg-red/10"
                        tokenSelectorTextColor="text-token-bg-red"
                        maxValue={100000000}
                        bottomRightContent={
                          metrics.liquidationRisk &&
                          borrowAmount &&
                          borrowAmount.gt(0) ? (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <span className="text-neutral-800 text-xs font-medium font-sora leading-3">
                                <span className="hidden sm:inline">
                                  Liquidation Risk:
                                </span>
                                <span className="sm:hidden">Risk:</span>
                              </span>
                              <div
                                className={`px-1.5 sm:px-2 py-3 h-6 flex items-center justify-center rounded-md border ${
                                  metrics.liquidationRisk === "Low"
                                    ? "bg-green-500/10 border-green-500/20"
                                    : metrics.liquidationRisk === "Medium"
                                    ? "bg-amber-500/10 border-amber-500/20"
                                    : "bg-red-500/10 border-red-500/20"
                                }`}
                              >
                                <span
                                  className={`text-xs font-normal font-sora ${
                                    metrics.liquidationRisk === "Low"
                                      ? "text-green-700"
                                      : metrics.liquidationRisk === "Medium"
                                      ? "text-amber-700"
                                      : "text-red-700"
                                  }`}
                                >
                                  {metrics.liquidationRisk}
                                </span>
                              </div>
                            </div>
                          ) : undefined
                        }
                      />
                    )}
                  </form.Field>

                  {/* Interest Rate Options */}
                  <InterestRateSelector
                    interestRate={
                      interestRate ? Number(interestRate.toString()) : 5
                    }
                    onInterestRateChange={(rate) => {
                      if (!isSending && !isPending) {
                        const rateBig = new Big(rate).round(2);
                        form.setFieldValue("interestRate", rateBig);
                        // Update URL
                        setInterestRate(rateBig);
                      }
                    }}
                    disabled={isSending || isPending}
                    borrowAmount={borrowAmount ?? undefined}
                    collateralAmount={collateralAmount ?? undefined}
                    collateralPriceUSD={bitcoin?.price}
                    collateralType={collateral.id}
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
                                borrowAmount.lte(0) ||
                                isSending ||
                                isPending ||
                                !canSubmit)
                            }
                            className="w-full h-12 bg-token-bg-blue hover:bg-blue-600 text-white text-sm font-medium font-sora py-4 px-6 rounded-xl transition-all whitespace-nowrap"
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
                </div>
              </form>
            )}
          </div>

          {/* Right Panel - Transaction Summary and Redemption Info */}
          <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:min-w-[320px] space-y-4">
            <TransactionSummary
              type="open"
              changes={{
                collateral: {
                  to: collateralAmount || new Big(0),
                  token: collateral.symbol,
                },
                collateralValueUSD: {
                  to:
                    collateralAmount && bitcoin?.price
                      ? collateralAmount.times(bitcoin.price)
                      : new Big(0),
                },
                debt: {
                  to: borrowAmount || new Big(0),
                },
                interestRate: {
                  to: interestRate || new Big(5),
                },
              }}
              liquidationPrice={metrics.liquidationPrice}
              collateralType={collateral.id}
            />
            <RedemptionInfo />
          </div>
        </div>
      </div>
    </>
  );
}

export default Borrow;

export function meta(args: Route.MetaArgs) {
  return createMeta(args, {
    title: "Uncap - Borrow against BTC",
    description: "Borrow against BTC at the lowest rates with Uncap Finance",
  });
}
