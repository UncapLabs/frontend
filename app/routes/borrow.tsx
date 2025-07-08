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
  TransactionStatus,
} from "~/components/borrow";
import { useState, useMemo } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { type BorrowFormData } from "~/types/borrow";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import { useFormCalculations } from "~/hooks/use-form-calculations";
import { MAX_LIMIT, MAX_LTV, getAnnualInterestRate } from "~/lib/utils/calc";
import type { Route } from "./+types/dashboard";
import { useAccount, useBalance } from "@starknet-react/core";
import { TBTC_ADDRESS } from "~/lib/constants";
import { toast } from "sonner";
import { useBorrow } from "~/hooks/use-borrow";

function Borrow() {
  const { address } = useAccount();
  const { data: bitcoinBalance } = useBalance({
    token: TBTC_ADDRESS,
    address: address,
    refetchInterval: 30000,
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
      console.log("Form submitted:", value);
      // This will be handled by the borrow transaction
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
  const isValid = useStore(form.store, (state) => state.isValid);

  // Create button text based on form state and validation
  const buttonText = useMemo(() => {
    if (!address) {
      return "Connect Wallet";
    }

    if (!collateralAmount) {
      return "Enter collateral amount";
    }

    if (!borrowAmount) {
      return "Enter borrow amount";
    }

    if (!isValid) {
      return "Check inputs";
    }

    return "Borrow";
  }, [address, collateralAmount, borrowAmount, isValid]);

  // Handlers using TanStack Form
  const handleLtvSliderChange = (value: number[]) => {
    const intendedLtvPercentage = Math.min(value[0], MAX_LTV * 100);
    const newBorrowAmount = computeBorrowFromLTV(intendedLtvPercentage);
    form.setFieldValue("borrowAmount", newBorrowAmount);
  };

  const handlePercentageClick = (
    percentage: number,
    type: "collateral" | "borrow"
  ) => {
    if (type === "collateral") {
      const balance = bitcoinBalance?.value
        ? Number(bitcoinBalance.value) / 1e18
        : 0;
      form.setFieldValue("collateralAmount", balance * percentage);
    } else {
      const maxBorrowable = debtLimit;
      form.setFieldValue("borrowAmount", maxBorrowable * percentage);
    }
  };

  const handleBorrowClick = async () => {
    if (!isReady) {
      if (!address) {
        toast.error("Please connect your wallet");
      }
      return;
    }

    if (!canSubmit || !collateralAmount || !borrowAmount) {
      return;
    }

    try {
      await send();
    } catch (error) {
      console.error("Transaction error:", error);
    }
  };

  const handleNewBorrow = () => {
    form.reset();
  };

  // Show transaction UI based on transaction state
  const shouldShowTransactionUI =
    isPending ||
    isTransactionSuccess ||
    (isTransactionError && !!transactionHash);

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
              shouldShowLoading={isPending}
              shouldShowSuccess={isTransactionSuccess}
              transactionDetails={
                collateralAmount && borrowAmount && transactionHash
                  ? {
                      collateralAmount,
                      borrowAmount,
                      transactionHash,
                    }
                  : null
              }
              annualInterestRate={annualInterestRate}
              transactionHash={transactionHash}
              onNewBorrow={handleNewBorrow}
              isPending={isPending}
              isError={isTransactionError}
              error={transactionError}
            />
          ) : (
            <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
              <CardContent className="pt-6 space-y-6">
                {/* Deposit Collateral Section */}
                <form.Field
                  name="collateralAmount"
                  validators={{
                    onChange: ({ value }) => {
                      if (value && value > 0) {
                        if (!address) {
                          return "Please connect your wallet";
                        }

                        // Check balance if wallet is connected
                        if (address && bitcoinBalance) {
                          const balance = Number(bitcoinBalance.value) / 1e18;
                          if (value > balance) {
                            return "Insufficient balance";
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
                      error={
                        field.state.meta.errors?.length
                          ? Array.isArray(field.state.meta.errors)
                            ? field.state.meta.errors
                            : ([field.state.meta.errors].filter(
                                Boolean
                              ) as string[])
                          : undefined
                      }
                    />
                  )}
                </form.Field>

                <div className="relative flex justify-center items-center py-3">
                  <div className="w-full h-px bg-slate-200"></div>
                  <Button
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
                        if (!address) {
                          return "Please connect your wallet";
                        }

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
                        if (value > debtLimit) {
                          return "Exceeds maximum borrowable amount";
                        }

                        // Check LTV ratio
                        if (ltvValue > MAX_LTV * 100) {
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
                      error={
                        field.state.meta.errors?.length
                          ? Array.isArray(field.state.meta.errors)
                            ? field.state.meta.errors
                            : ([field.state.meta.errors].filter(
                                Boolean
                              ) as string[])
                          : undefined
                      }
                    />
                  )}
                </form.Field>

                {/* LTV Slider and Borrow Button */}
                <div className="flex flex-col items-start space-y-4 mt-6">
                  <LtvSlider
                    ltvValue={ltvValue}
                    onValueChange={handleLtvSliderChange}
                    disabled={!collateralAmount || collateralAmount <= 0}
                  />

                  <Button
                    disabled={
                      !address ||
                      !canSubmit ||
                      !collateralAmount ||
                      !borrowAmount ||
                      borrowAmount <= 0 ||
                      isPending // Disable while transaction is pending
                    }
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-6 rounded-xl shadow-sm hover:shadow transition-all whitespace-nowrap"
                    onClick={handleBorrowClick}
                  >
                    {isPending ? "Confirming..." : buttonText}
                  </Button>
                </div>

                {/* Interest Rate Options */}
                <InterestRateSelector
                  selectedRate={selectedRate}
                  selfManagedRate={selfManagedRate}
                  onRateChange={(rate) =>
                    form.setFieldValue("selectedRate", rate)
                  }
                  onSelfManagedRateChange={(rate) =>
                    form.setFieldValue("selfManagedRate", rate)
                  }
                />
              </CardContent>
            </Card>
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
