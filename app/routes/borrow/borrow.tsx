import { Button } from "~/components/ui/button";
import { InterestRateSelector } from "~/components/borrow/interest-rate-selector";
import { RedemptionInfo } from "~/components/borrow/redemption-info";
import { BorrowingRestrictionsAlert } from "~/components/borrow/borrowing-restrictions-alert";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { TransactionSummary } from "~/components/transaction-summary";
import { TokenInput } from "~/components/token-input";
import { ArrowIcon, ResponsiveArrowIcon } from "~/components/icons/arrow-icon";
import { useEffect, useCallback } from "react";
import { useForm } from "@tanstack/react-form";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import { computeDebtLimit } from "~/lib/utils/calc";
import { MAX_LIMIT } from "~/lib/contracts/constants";
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
import { usePositionMetrics } from "~/hooks/use-position-metrics";
import { getMinCollateralizationRatio } from "~/lib/contracts/collateral-config";
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

  const { bitcoin, usdu } = useFetchPrices({
    collateralType,
    enabled:
      (collateralAmount !== null &&
        collateralAmount !== undefined &&
        collateralAmount > 0) ||
      (borrowAmount !== null && borrowAmount !== undefined && borrowAmount > 0),
  });
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
        // For borrow, percentage represents LTV (Loan-to-Value)
        // If collateral is worth $100k and user clicks 50%, they want to borrow $50k
        const collateral = form.getFieldValue("collateralAmount") || 0;
        const btcPrice = bitcoin?.price || 0;
        const usduPrice = usdu?.price || 1;
        const collateralValueUSD = collateral * btcPrice;
        const borrowAmountUSD = collateralValueUSD * percentage;
        const newValue = borrowAmountUSD / usduPrice; // Convert USD value to USDU amount
        form.setFieldValue("borrowAmount", newValue);
        // Manually trigger validation after setting value
        form.validateField("borrowAmount", "change");
      }
    },
    [
      bitcoinBalance?.value,
      selectedCollateralToken.decimals,
      bitcoin?.price,
      usdu?.price,
      form,
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
    <div className="mx-auto max-w-2xl md:max-w-4xl lg:max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <h1 className="text-3xl font-medium leading-none mb-4 font-sora text-neutral-800">
          Borrow
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 md:max-w-3xl lg:max-w-5xl gap-4">
        {/* Left Panel */}
        <div className="md:col-span-4">
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
                      label="Borrow Amount"
                      percentageButtons
                      percentageButtonsOnHover
                      onPercentageClick={handleBorrowPercentageClick}
                      disabled={isSending || isPending}
                      showBalance={false}
                      tokenSelectorBgColor="bg-token-bg-red/10"
                      tokenSelectorTextColor="text-token-bg-red"
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
        <div className="md:col-span-3 space-y-4">
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
            warnings={
              borrowAmount && borrowAmount < 2000
                ? ["Minimum debt requirement is $2,000 USDU"]
                : []
            }
            collateralType={selectedCollateralToken.collateralType}
          />
          <RedemptionInfo variant="inline" />
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
