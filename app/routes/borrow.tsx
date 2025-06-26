import { Button } from "~/components/ui/button";
import { NumericFormat, type NumberFormatValues } from "react-number-format";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  RefreshCw,
  HelpCircle,
  ArrowDown,
  Check,
  CheckCircle2,
  Loader2,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { Slider } from "~/components/ui/slider";
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
import {
  INTEREST_RATE_SCALE_DOWN_FACTOR,
  TBTC_ADDRESS,
  TBTC_SYMBOL,
} from "~/lib/constants";
import { useBorrowTransaction } from "~/hooks/use-borrow-transaction";
import { getLtvColor } from "~/lib/utils";
import { toast } from "sonner";

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
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [transactionSubmitted, setTransactionSubmitted] = useState(false);

  // Conditional price fetching
  const { bitcoin, bitUSD, refetchBitcoin, refetchBitUSD } =
    useFetchPrices(collateralAmount);

  // Store transaction details for success screen
  const [transactionDetails, setTransactionDetails] = useState<{
    collateralAmount: number;
    borrowAmount: number;
    transactionHash: string;
  } | null>(null);

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

  const {
    send,
    isPending,
    isReady,
    isTransactionSuccess,
    isTransactionError,
    transactionError,
    data,
  } = useBorrowTransaction({
    collateralAmount,
    borrowAmount,
    annualInterestRate,
  });

  // Track when transaction is submitted
  if (isPending && !transactionSubmitted) {
    setTransactionSubmitted(true);
  }

  // Get form validation state
  const canSubmit = useStore(form.store, (state) => state.canSubmit);
  const isValid = useStore(form.store, (state) => state.isValid);

  // Create button text based on form state and validation
  const buttonText = useMemo(() => {
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
  }, [collateralAmount, borrowAmount, isValid]);

  // Handlers using TanStack Form
  const handleCollateralChange = (values: NumberFormatValues) => {
    form.setFieldValue("collateralAmount", Number(values.value) || undefined);
  };

  const handleBorrowAmountChange = (values: NumberFormatValues) => {
    form.setFieldValue("borrowAmount", Number(values.value) || undefined);
  };

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

  // Handle success
  if (isTransactionSuccess && data?.transaction_hash && !showSuccessScreen) {
    toast.success("Transaction Successful! 🎉", {
      description: `Successfully borrowed ${borrowAmount?.toLocaleString()} bitUSD`,
      action: {
        label: "View",
        onClick: () =>
          window.open(
            `https://voyager.online/tx/${data.transaction_hash}`,
            "_blank"
          ),
      },
    });

    setTransactionDetails({
      collateralAmount: collateralAmount || 0,
      borrowAmount: borrowAmount || 0,
      transactionHash: data.transaction_hash,
    });
    setShowSuccessScreen(true);
    setTransactionSubmitted(false); // Reset for next transaction
  }

  // Handle error (including user rejection)
  if (isTransactionError && transactionError && !showSuccessScreen) {
    const errorMessage =
      transactionError.message || "The transaction failed. Please try again.";
    const isUserRejection =
      errorMessage.toLowerCase().includes("reject") ||
      errorMessage.toLowerCase().includes("cancel") ||
      errorMessage.toLowerCase().includes("denied") ||
      errorMessage.toLowerCase().includes("user abort");

    if (isUserRejection) {
      toast.info("Transaction Cancelled", {
        description: "You cancelled the transaction.",
      });
    } else {
      toast.error("Transaction Failed", {
        description: errorMessage,
      });
    }

    setTransactionSubmitted(false); // Reset on error
  }

  const handleBorrowClick = () => {
    if (isReady && canSubmit) {
      send();
    }
  };

  const handleNewBorrow = () => {
    setShowSuccessScreen(false);
    setTransactionSubmitted(false);
    form.reset();
    setTransactionDetails(null);
  };

  // Show loading only when transaction is pending (after wallet approval)
  // If user rejects, isPending becomes false and isTransactionError becomes true
  const shouldShowLoading =
    transactionSubmitted && !showSuccessScreen && !isTransactionError;
  const shouldShowSuccess = showSuccessScreen && !!transactionDetails;


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
          {shouldShowLoading || shouldShowSuccess ? (
            <TransactionStatus
              shouldShowLoading={shouldShowLoading}
              shouldShowSuccess={shouldShowSuccess}
              transactionDetails={transactionDetails}
              annualInterestRate={annualInterestRate}
              transactionHash={data?.transaction_hash}
              onNewBorrow={handleNewBorrow}
            />
          ) : (
            <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
              <CardContent className="pt-6 space-y-6">
                {/* Deposit Collateral Section */}
                <form.Field
                  name="collateralAmount"
                  validators={{
                    onChange: ({ value }) => {
                      if (value && bitcoinBalance) {
                        const balance = Number(bitcoinBalance.value) / 1e18;
                        if (value > balance) {
                          return "Insufficient balance";
                        }
                      }
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <CollateralInput
                      value={field.state.value}
                      onChange={handleCollateralChange}
                      onBlur={field.handleBlur}
                      bitcoin={bitcoin}
                      bitcoinBalance={bitcoinBalance}
                      onPercentageClick={(percentage) => handlePercentageClick(percentage, "collateral")}
                      error={field.state.meta.errors as string[] | undefined}
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
                        const collateral =
                          fieldApi.form.getFieldValue("collateralAmount");

                        // Require collateral if borrow amount is entered
                        if (!collateral || collateral <= 0) {
                          return "Please enter a valid collateral amount first";
                        }

                        // Check minimum borrow amount
                        if (bitUSD?.price) {
                          const borrowValue = value * bitUSD.price;
                          if (borrowValue < 2000) {
                            return "Minimum borrow amount is $2000";
                          }
                        }
                      }
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <BorrowInput
                      value={field.state.value}
                      onChange={handleBorrowAmountChange}
                      onBlur={field.handleBlur}
                      bitUSD={bitUSD}
                      onPercentageClick={(percentage) => handlePercentageClick(percentage, "borrow")}
                      error={field.state.meta.errors as string[] | undefined}
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
                  onRateChange={(rate) => form.setFieldValue("selectedRate", rate)}
                  onSelfManagedRateChange={(rate) => form.setFieldValue("selfManagedRate", rate)}
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
