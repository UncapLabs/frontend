import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ArrowDown } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { InterestRateSelector } from "~/components/borrow";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { TokenInput } from "~/components/token-input";
import { useMemo, useEffect, useCallback } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import {
  MAX_LIMIT,
  MAX_LTV,
  getAnnualInterestRate,
  computeDebtLimit,
} from "~/lib/utils/calc";
import { validators } from "~/lib/validators";
import type { Route } from "./+types/dashboard";
import {
  useAccount,
  useBalance,
  useConnect,
  type Connector,
} from "@starknet-react/core";
import {
  type StarknetkitConnector,
  useStarknetkitConnectModal,
} from "starknetkit";
import {
  INTEREST_RATE_SCALE_DOWN_FACTOR,
  TBTC_TOKEN,
  LBTC_TOKEN,
  BITUSD_TOKEN,
} from "~/lib/contracts/constants";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { useBorrow, type BorrowFormData } from "~/hooks/use-borrow";
import { useQueryState } from "nuqs";

function Borrow() {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as StarknetkitConnector[],
  });

  // Available collateral tokens
  const collateralTokens = [TBTC_TOKEN, LBTC_TOKEN];

  // URL state for form inputs
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useQueryState(
    "collateral",
    {
      defaultValue: TBTC_TOKEN.symbol,
    }
  );

  const [urlCollateralAmount, setUrlCollateralAmount] = useQueryState(
    "amount",
    {
      defaultValue: "",
    }
  );

  const [urlBorrowAmount, setUrlBorrowAmount] = useQueryState("borrow", {
    defaultValue: "",
  });

  const [urlInterestRate, setUrlInterestRate] = useQueryState("rate", {
    defaultValue: "5",
  });

  // Initialize form with URL values
  const form = useForm({
    defaultValues: {
      collateralAmount: urlCollateralAmount
        ? parseFloat(urlCollateralAmount)
        : (undefined as number | undefined),
      borrowAmount: urlBorrowAmount
        ? parseFloat(urlBorrowAmount)
        : (undefined as number | undefined),
      interestRate: parseInt(urlInterestRate) || 5,
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
        // Update persisted form data before sending
        updateFormData({
          collateralAmount: value.collateralAmount,
          borrowAmount: value.borrowAmount,
          interestRate: value.interestRate,
          selectedCollateralToken: selectedCollateralToken.symbol,
        });

        await send();
      } catch (error) {
        console.error("Transaction error:", error);
      }
    },
  });

  const {
    collateralAmount,
    borrowAmount,
    interestRate: selectedRate,
  } = useStore(form.store, (state) => ({
    collateralAmount: state.values.collateralAmount,
    borrowAmount: state.values.borrowAmount,
    interestRate: state.values.interestRate,
  }));

  // Revalidate fields when wallet connection changes
  useEffect(() => {
    // Only run validation if wallet just connected (not on disconnect)
    if (address) {
      // Validate collateral if user has entered a value
      if (collateralAmount !== undefined && collateralAmount > 0) {
        form.validateField("collateralAmount", "change");
      }
      // Validate borrow amount if user has entered a value
      if (borrowAmount !== undefined && borrowAmount > 0) {
        form.validateField("borrowAmount", "change");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]); // Intentionally only re-run when wallet connection changes

  // Calculate annual interest rate
  const annualInterestRate = useMemo(() => {
    return getAnnualInterestRate(selectedRate);
  }, [selectedRate]);

  // Get selected token from URL
  const selectedCollateralToken =
    collateralTokens.find((t) => t.symbol === selectedTokenSymbol) ||
    TBTC_TOKEN;

  // Use the borrow hook with integrated state management
  const {
    send,
    isPending,
    error: transactionError,
    transactionHash,
    isReady,
    currentState,
    formData,
    updateFormData,
    reset,
    transactionHash: persistedTransactionHash,
    error: persistedError,
  } = useBorrow({
    collateralAmount,
    borrowAmount,
    annualInterestRate,
    collateralToken: selectedCollateralToken,
  });

  // Balance for selected token
  const { data: bitcoinBalance } = useBalance({
    token: selectedCollateralToken.address,
    address: address,
    refetchInterval: 30000,
  });

  // Conditional price fetching
  const { bitcoin, bitUSD } = useFetchPrices(collateralAmount);

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
        // Calculate debt limit inline
        const collateral = form.getFieldValue("collateralAmount") || 0;
        const btcPrice = bitcoin?.price || 0;
        const maxBorrowable = computeDebtLimit(collateral, btcPrice);
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
    setUrlBorrowAmount("");
    setUrlCollateralAmount("");
    setUrlInterestRate("5");
  }, [form, reset]);

  // Handle wallet connection - memoized
  const connectWallet = useCallback(async () => {
    const { connector } = await starknetkitConnectModal();
    if (!connector) {
      return;
    }
    connect({ connector: connector as Connector });
  }, [starknetkitConnectModal, connect]);

  // Show transaction UI only for pending, success, or error states
  const shouldShowTransactionUI = ["pending", "success", "error"].includes(
    currentState
  );

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <h1 className="text-3xl font-bold mb-2 text-slate-800">Borrow</h1>
      </div>
      <Separator className="mb-8 bg-slate-200" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Panel */}
        <div className="md:col-span-2">
          {shouldShowTransactionUI ? (
            <TransactionStatus
              transactionHash={transactionHash || persistedTransactionHash}
              isError={currentState === "error"}
              isSuccess={currentState === "success"}
              error={
                (currentState === "error" && persistedError
                  ? { ...persistedError, name: "TransactionError" }
                  : transactionError) as Error | null
              }
              successTitle="Borrow Successful!"
              successSubtitle="Your position has been created successfully."
              details={
                formData.collateralAmount &&
                formData.borrowAmount &&
                (transactionHash || persistedTransactionHash)
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
                            bitUSD
                          </>
                        ),
                      },
                      {
                        label: "Interest Rate (APR)",
                        value: `${
                          Number(annualInterestRate) /
                          Number(INTEREST_RATE_SCALE_DOWN_FACTOR)
                        }%`,
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
              <Card
                className={`border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                  currentState === "confirming" || isPending ? "opacity-75" : ""
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
                        tokens={collateralTokens}
                        onTokenChange={(token) => {
                          setSelectedTokenSymbol(token.symbol);
                          // Reset amount when token changes
                          field.handleChange(undefined as number | undefined);
                        }}
                        balance={bitcoinBalance}
                        price={bitcoin}
                        value={field.state.value}
                        onChange={(value) => {
                          field.handleChange(value);
                          // Update URL
                          setUrlCollateralAmount(value ? value.toString() : "");
                        }}
                        onBlur={field.handleBlur}
                        label="You deposit"
                        percentageButtons
                        onPercentageClick={handleCollateralPercentageClick}
                        disabled={currentState === "confirming" || isPending}
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
                        if (!bitcoin?.price || !bitUSD?.price) return undefined;

                        // Calculate debt limit inline
                        const debtLimit = collateral
                          ? computeDebtLimit(collateral, bitcoin.price)
                          : 0;

                        return validators.compose(
                          validators.requiresCollateral(value, collateral),
                          validators.minimumUsdValue(value, bitUSD.price, 2000),
                          validators.debtLimit(value, debtLimit),
                          // LTV check
                          (() => {
                            if (!collateral) return undefined;
                            const collateralValue = collateral * bitcoin.price;
                            const borrowValue = value * bitUSD.price;
                            return validators.ltvRatio(
                              borrowValue,
                              collateralValue,
                              MAX_LTV * 100
                            );
                          })()
                        );
                      },
                    }}
                  >
                    {(field) => (
                      <TokenInput
                        token={BITUSD_TOKEN}
                        price={bitUSD}
                        value={field.state.value}
                        onChange={(value) => {
                          field.handleChange(value);
                          // Update URL
                          setUrlBorrowAmount(value ? value.toString() : "");
                        }}
                        onBlur={field.handleBlur}
                        label="You borrow"
                        percentageButtons
                        percentageButtonsOnHover
                        onPercentageClick={handleBorrowPercentageClick}
                        disabled={currentState === "confirming" || isPending}
                        showBalance={false}
                      />
                    )}
                  </form.Field>

                  {/* Interest Rate Options */}
                  <InterestRateSelector
                    interestRate={selectedRate}
                    onInterestRateChange={(rate) => {
                      if (currentState !== "confirming" && !isPending) {
                        form.setFieldValue("interestRate", rate);
                        // Update URL
                        setUrlInterestRate(rate.toString());
                      }
                    }}
                    disabled={currentState === "confirming" || isPending}
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
                                currentState === "confirming" ||
                                isPending ||
                                !canSubmit)
                            }
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-6 rounded-xl shadow-sm hover:shadow transition-all whitespace-nowrap"
                          >
                            {currentState === "confirming"
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
      </div>
    </div>
  );
}

export default Borrow;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "BitUSD" },
    { name: "This is bitUSD", content: "Welcome to bitUSD!" },
  ];
}
