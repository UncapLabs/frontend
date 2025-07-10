import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ArrowDown } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import {
  CollateralInput,
  BorrowInput,
  InterestRateSelector,
  LtvSlider,
  PositionSummary,
} from "~/components/borrow";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { useState, useMemo, useEffect } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { type BorrowFormData } from "~/types/borrow";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import { useFormCalculations } from "~/hooks/use-form-calculations";
import { MAX_LIMIT, MAX_LTV, getAnnualInterestRate } from "~/lib/utils/calc";
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
  TBTC_ADDRESS,
  TBTC_SYMBOL,
  INTEREST_RATE_SCALE_DOWN_FACTOR,
} from "~/lib/constants";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { useBorrow } from "~/hooks/use-borrow";
import { useQueryState } from "nuqs";

function Borrow() {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as StarknetkitConnector[],
  });
  const { data: bitcoinBalance } = useBalance({
    token: TBTC_ADDRESS,
    address: address,
    refetchInterval: 30000,
  });

  // Check if we have a transaction hash in URL
  const [urlTransactionHash, setUrlTransactionHash] = useQueryState("tx", {
    defaultValue: "",
  });

  // Create properly typed default values
  const defaultBorrowFormValues: BorrowFormData = {
    collateralAmount: undefined,
    borrowAmount: undefined,
    selectedRate: "fixed",
    selfManagedRate: 5,
  };

  // Form setup with TanStack Form
  const form = useForm({
    defaultValues: defaultBorrowFormValues,
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

  // Get form values reactively
  const collateralAmount = useStore(
    form.store,
    (state) => state.values.collateralAmount
  );
  const borrowAmount = useStore(
    form.store,
    (state) => state.values.borrowAmount
  );
  const selectedRate = useStore(
    form.store,
    (state) => state.values.selectedRate
  );
  const selfManagedRate = useStore(
    form.store,
    (state) => state.values.selfManagedRate
  );

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

  // State for UI interactions
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Conditional price fetching
  const { bitcoin, bitUSD, refetchBitcoin, refetchBitUSD } =
    useFetchPrices(collateralAmount);

  // Calculate annual interest rate
  const annualInterestRate = useMemo(() => {
    return getAnnualInterestRate(selectedRate, selfManagedRate);
  }, [selectedRate, selfManagedRate]);

  // Use form calculations hook
  const {
    ltvValue,
    debtLimit,
    healthFactor,
    liquidationPrice,
    computeBorrowFromLTV,
  } = useFormCalculations(
    collateralAmount,
    borrowAmount,
    bitcoin?.price,
    bitUSD?.price
  );

  // Use the borrow hook
  const {
    send,
    isPending,
    isSending,
    isError: isTransactionError,
    error: transactionError,
    transactionHash,
    isReady,
    isSuccess: isTransactionSuccess,
  } = useBorrow({
    collateralAmount,
    borrowAmount,
    annualInterestRate,
  });

  // Get form validation state
  const canSubmit = useStore(form.store, (state) => state.canSubmit);

  // Get field-specific errors reactively using the store
  const collateralErrors = useStore(form.store, (state) => {
    const field = state.fieldMeta.collateralAmount;
    return field?.errors || [];
  });

  const borrowErrors = useStore(form.store, (state) => {
    const field = state.fieldMeta.borrowAmount;
    return field?.errors || [];
  });

  // Create button text based on form state and validation
  const buttonText = useMemo(() => {
    if (!address) {
      return "Connect Wallet";
    }

    // Show specific error messages in button
    if (collateralErrors.length > 0) {
      return collateralErrors[0];
    }

    if (borrowErrors.length > 0) {
      return borrowErrors[0];
    }

    if (!collateralAmount) {
      return "Deposit collateral";
    }

    if (!borrowAmount) {
      return "Enter borrow amount";
    }

    return "Borrow";
  }, [address, collateralAmount, borrowAmount, collateralErrors, borrowErrors]);

  // Handlers using TanStack Form
  const handleLtvSliderChange = (value: number[]) => {
    const intendedLtvPercentage = Math.min(value[0], MAX_LTV * 100);
    const newBorrowAmount = computeBorrowFromLTV(intendedLtvPercentage);
    form.setFieldValue("borrowAmount", newBorrowAmount);
    // Manually trigger validation after setting value
    form.validateField("borrowAmount", "change");
  };

  const handlePercentageClick = (
    percentage: number,
    type: "collateral" | "borrow"
  ) => {
    if (type === "collateral") {
      const balance = bitcoinBalance?.value
        ? Number(bitcoinBalance.value) / 1e18
        : 0;
      const newValue = balance * percentage;
      form.setFieldValue("collateralAmount", newValue);
      // Manually trigger validation after setting value
      form.validateField("collateralAmount", "change");
    } else {
      const maxBorrowable = debtLimit;
      const newValue = maxBorrowable * percentage;
      form.setFieldValue("borrowAmount", newValue);
      // Manually trigger validation after setting value
      form.validateField("borrowAmount", "change");
    }
  };

  const handleNewBorrow = () => {
    form.reset();
    setUrlTransactionHash("");
  };

  // Handle wallet connection
  const connectWallet = async () => {
    const { connector } = await starknetkitConnectModal();
    if (!connector) {
      return;
    }
    await connect({ connector: connector as Connector });
  };

  // Update URL when we get a transaction hash
  if (transactionHash && transactionHash !== urlTransactionHash) {
    setUrlTransactionHash(transactionHash);
  }

  // Show transaction UI if we have a hash in URL (single source of truth)
  const shouldShowTransactionUI = !!urlTransactionHash;

  // Original form UI
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
              transactionHash={transactionHash}
              isError={isTransactionError}
              isSuccess={isTransactionSuccess}
              error={transactionError}
              successTitle="Borrow Successful!"
              successSubtitle="Your position has been created successfully."
              details={
                collateralAmount && borrowAmount && urlTransactionHash
                  ? [
                      {
                        label: "Collateral Deposited",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={collateralAmount}
                              thousandSeparator=","
                              decimalScale={7}
                              fixedDecimalScale={false}
                            />{" "}
                            {TBTC_SYMBOL}
                          </>
                        ),
                      },
                      {
                        label: "Amount Borrowed",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={borrowAmount}
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
                  isSending || isPending ? "opacity-75" : ""
                }`}
              >
                <CardContent className="pt-6 space-y-6">
                  {/* Deposit Collateral Section */}
                  <form.Field
                    name="collateralAmount"
                    validators={{
                      onChange: ({ value }) => {
                        if (value && value > 0) {
                          // Only validate balance if wallet is connected
                          if (address && bitcoinBalance) {
                            const balance = Number(bitcoinBalance.value) / 1e18;
                            if (value > balance) {
                              return "Insufficient collateral balance";
                            }
                          }

                          // Check against maximum limit
                          if (value >= MAX_LIMIT) {
                            return `Maximum collateral amount is ${MAX_LIMIT.toLocaleString()}`;
                          }
                        }
                        return undefined;
                      },
                    }}
                    listeners={{
                      onChange: ({ fieldApi }) => {
                        // When collateral changes, revalidate borrow amount
                        // This ensures LTV and debt limit checks are re-run
                        if (borrowAmount !== undefined && borrowAmount > 0) {
                          fieldApi.form.validateField("borrowAmount", "change");
                        }
                      },
                    }}
                  >
                    {(field) => (
                      <CollateralInput
                        value={field.state.value}
                        onChange={(values) =>
                          field.handleChange(Number(values.value) || undefined)
                        }
                        onBlur={field.handleBlur}
                        bitcoin={bitcoin}
                        bitcoinBalance={bitcoinBalance}
                        onPercentageClick={(percentage) =>
                          handlePercentageClick(percentage, "collateral")
                        }
                        error={undefined}
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
                    validators={{
                      onChange: ({ value, fieldApi }) => {
                        if (value && value > 0) {
                          const collateral =
                            fieldApi.form.getFieldValue("collateralAmount");

                          // Require collateral if borrow amount is entered
                          if (!collateral || collateral <= 0) {
                            return "Please enter collateral amount first";
                          }

                          // Check minimum borrow amount
                          if (bitUSD?.price) {
                            const borrowValue = value * bitUSD.price;
                            if (borrowValue < 2000) {
                              return "Minimum borrow amount is $2,000";
                            }
                          }

                          // Check against debt limit
                          // Calculate debt limit based on current collateral
                          const collateralValue =
                            collateral * (bitcoin?.price || 0);
                          const currentDebtLimit =
                            (collateralValue * MAX_LTV) / (bitUSD?.price || 1);

                          if (value > currentDebtLimit) {
                            return "Exceeds maximum borrowable amount";
                          }

                          // Check LTV ratio
                          // Calculate current LTV based on current values
                          const currentCollateralValue =
                            collateral * (bitcoin?.price || 0);
                          const currentBorrowValue =
                            value * (bitUSD?.price || 1);
                          const currentLTV =
                            currentCollateralValue > 0
                              ? (currentBorrowValue / currentCollateralValue) *
                                100
                              : 0;

                          if (currentLTV > MAX_LTV * 100) {
                            return "LTV ratio too high";
                          }
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <BorrowInput
                        value={field.state.value}
                        onChange={(values) =>
                          field.handleChange(Number(values.value) || undefined)
                        }
                        onBlur={field.handleBlur}
                        bitUSD={bitUSD}
                        onPercentageClick={(percentage) =>
                          handlePercentageClick(percentage, "borrow")
                        }
                        error={undefined}
                        disabled={isSending || isPending}
                      />
                    )}
                  </form.Field>

                  {/* LTV Slider and Borrow Button */}
                  <div className="flex flex-col items-start space-y-4 mt-6">
                    <LtvSlider
                      ltvValue={ltvValue}
                      onValueChange={handleLtvSliderChange}
                      disabled={
                        !collateralAmount ||
                        collateralAmount <= 0 ||
                        isSending ||
                        isPending
                      }
                    />

                    <Button
                      type={address ? "submit" : "button"}
                      onClick={!address ? connectWallet : undefined}
                      disabled={
                        address &&
                        (!collateralAmount ||
                          !borrowAmount ||
                          borrowAmount <= 0 ||
                          isSending || // Disable while wallet is open
                          isPending || // Disable while transaction is pending
                          !canSubmit) // Keep validation check but allow error messages to show
                      }
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-6 rounded-xl shadow-sm hover:shadow transition-all whitespace-nowrap"
                    >
                      {isSending
                        ? "Confirm in wallet..."
                        : isPending
                        ? "Confirming..."
                        : buttonText}
                    </Button>
                  </div>

                  {/* Interest Rate Options */}
                  <InterestRateSelector
                    selectedRate={selectedRate}
                    selfManagedRate={selfManagedRate}
                    onRateChange={(rate) => {
                      if (!isSending && !isPending) {
                        form.setFieldValue("selectedRate", rate);
                      }
                    }}
                    onSelfManagedRateChange={(rate) => {
                      if (!isSending && !isPending) {
                        form.setFieldValue("selfManagedRate", rate);
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </form>
          )}
        </div>

        {/* Right Panel */}
        <div className="md:col-span-1 space-y-6">
          {/* Vault Summary Card */}
          <PositionSummary
            debtLimit={debtLimit}
            healthFactor={healthFactor}
            liquidationPrice={liquidationPrice}
            isRefreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              refetchBitcoin();
              refetchBitUSD();
            }}
          />
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
