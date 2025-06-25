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
  const shouldShowSuccess = showSuccessScreen && transactionDetails;

  // Loading/Success Screen Component
  const TransactionStatusContent = () => {
    if (shouldShowLoading) {
      // Loading state - transaction is approved and pending
      return (
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-slate-800">
                  Processing Transaction
                </h3>
                <p className="text-sm text-slate-600">
                  Your transaction is being confirmed on the blockchain...
                </p>
                {data?.transaction_hash && (
                  <p className="text-xs text-slate-500">
                    Transaction Hash: {data.transaction_hash.slice(0, 10)}...
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (shouldShowSuccess) {
      // Success state - same as before
      return (
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-slate-800">
                  Borrow Successful!
                </h3>
                <p className="text-sm text-slate-600">
                  Your position has been created successfully.
                </p>
              </div>

              <div className="w-full bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">
                    Collateral Deposited
                  </span>
                  <span className="font-semibold text-slate-800">
                    <NumericFormat
                      displayType="text"
                      value={transactionDetails.collateralAmount}
                      thousandSeparator=","
                      decimalScale={7}
                      fixedDecimalScale={false}
                    />{" "}
                    {TBTC_SYMBOL}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">
                    Amount Borrowed
                  </span>
                  <span className="font-semibold text-slate-800">
                    <NumericFormat
                      displayType="text"
                      value={transactionDetails.borrowAmount}
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                    />{" "}
                    bitUSD
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">
                    Interest Rate (APR)
                  </span>
                  <span className="font-semibold text-slate-800">
                    {annualInterestRate / INTEREST_RATE_SCALE_DOWN_FACTOR}%
                  </span>
                </div>
              </div>

              <div className="w-full flex flex-col space-y-3">
                <a
                  href={`https://voyager.online/tx/${transactionDetails.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Transaction <ExternalLink className="h-4 w-4" />
                </a>

                <Button
                  onClick={handleNewBorrow}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Create New Position
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

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
            <TransactionStatusContent />
          ) : (
            <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
              <CardContent className="pt-6 space-y-6">
                {/* Deposit Collateral Section */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-3 group">
                  <div className="flex justify-between items-center">
                    <Label
                      htmlFor="collateralAmount"
                      className="text-base md:text-lg font-medium text-slate-700"
                    >
                      You deposit
                    </Label>
                    {bitcoinBalance?.value && bitcoinBalance.value > 0 && (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors"
                          onClick={() =>
                            handlePercentageClick(0.25, "collateral")
                          }
                        >
                          25%
                        </Button>
                        <Button
                          variant="outline"
                          className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors"
                          onClick={() =>
                            handlePercentageClick(0.5, "collateral")
                          }
                        >
                          50%
                        </Button>
                        <Button
                          variant="outline"
                          className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors"
                          onClick={() =>
                            handlePercentageClick(0.75, "collateral")
                          }
                        >
                          75%
                        </Button>
                        <Button
                          variant="outline"
                          className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors font-medium"
                          onClick={() => handlePercentageClick(1, "collateral")}
                        >
                          Max.
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-start justify-between space-x-4">
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
                        <div className="flex-grow">
                          <NumericFormat
                            id="collateralAmount"
                            customInput={Input}
                            thousandSeparator=","
                            placeholder="0"
                            inputMode="decimal"
                            allowNegative={false}
                            decimalScale={7}
                            value={field.state.value}
                            onValueChange={handleCollateralChange}
                            onBlur={field.handleBlur}
                            isAllowed={(values) => {
                              const { floatValue } = values;
                              if (floatValue === undefined) return true;
                              return floatValue < MAX_LIMIT;
                            }}
                            className="text-3xl md:text-4xl font-semibold h-auto p-0 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none outline-none shadow-none tracking-tight text-slate-800"
                          />
                          <NumericFormat
                            className="text-sm text-slate-500 mt-1"
                            displayType="text"
                            value={
                              (bitcoin?.price || 0) * (field.state.value || 0)
                            }
                            prefix={"≈ $"}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />
                          {field.state.meta.errors && (
                            <p className="text-xs text-red-500 mt-1">
                              {field.state.meta.errors.join(" ")}
                            </p>
                          )}
                        </div>
                      )}
                    </form.Field>
                    <div className="text-right">
                      <Select defaultValue="BTC">
                        <SelectTrigger className="w-auto min-w-[120px] rounded-full h-10 pl-2 pr-3 border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors flex items-center">
                          <SelectValue placeholder="Token" />
                        </SelectTrigger>
                        <SelectContent className="border border-slate-200 shadow-md">
                          <SelectItem value="BTC">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-1 rounded-full mr-2">
                                <img
                                  src="/bitcoin.png"
                                  alt="BTC"
                                  className="h-5 w-5 object-cover"
                                />
                              </div>
                              <span className="font-medium">{TBTC_SYMBOL}</span>
                            </div>
                          </SelectItem>
                          {/* <SelectItem value="wBTC">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-1 rounded-full mr-2">
                                <img
                                  src="/bitcoin.png"
                                  alt="wBTC"
                                  className="h-5 w-5 object-cover"
                                />
                              </div>
                              <span className="font-medium">wBTC</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="lBTC">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-1 rounded-full mr-2">
                                <img
                                  src="/bitcoin.png"
                                  alt="lBTC"
                                  className="h-5 w-5 object-cover"
                                />
                              </div>
                              <span className="font-medium">lBTC</span>
                            </div>
                          </SelectItem> */}
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-slate-500 mt-1">
                        {bitcoinBalance?.value && bitcoinBalance.value > 0 && (
                          <>
                            Balance:{" "}
                            <NumericFormat
                              displayType="text"
                              value={bitcoinBalance.formatted}
                              thousandSeparator=","
                              decimalScale={3}
                              fixedDecimalScale
                            />{" "}
                            {TBTC_SYMBOL}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

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
                <div className="bg-slate-50 rounded-xl p-4 group">
                  <div className="flex justify-between items-center">
                    <Label
                      htmlFor="borrowAmount"
                      className="text-base md:text-lg font-medium text-slate-700"
                    >
                      You borrow
                    </Label>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out flex items-center space-x-1">
                      <Button
                        variant="outline"
                        className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors"
                        onClick={() => handlePercentageClick(0.25, "borrow")}
                      >
                        25%
                      </Button>
                      <Button
                        variant="outline"
                        className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors"
                        onClick={() => handlePercentageClick(0.5, "borrow")}
                      >
                        50%
                      </Button>
                      <Button
                        variant="outline"
                        className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors"
                        onClick={() => handlePercentageClick(0.75, "borrow")}
                      >
                        75%
                      </Button>
                      <Button
                        variant="outline"
                        className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors font-medium"
                        onClick={() => handlePercentageClick(1, "borrow")}
                      >
                        Max.
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start justify-between space-x-2 mt-2">
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
                        <div className="flex-grow">
                          <NumericFormat
                            id="borrowAmount"
                            customInput={Input}
                            thousandSeparator=","
                            placeholder="0"
                            inputMode="decimal"
                            allowNegative={false}
                            decimalScale={7}
                            value={field.state.value}
                            onValueChange={handleBorrowAmountChange}
                            onBlur={field.handleBlur}
                            isAllowed={(values) => {
                              const { floatValue } = values;
                              if (floatValue === undefined) return true;
                              return floatValue < MAX_LIMIT;
                            }}
                            className="text-3xl md:text-4xl font-semibold h-auto p-0 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none outline-none shadow-none tracking-tight text-slate-800"
                          />
                          <NumericFormat
                            className="text-sm text-slate-500 mt-1"
                            displayType="text"
                            value={
                              (bitUSD?.price || 0) * (field.state.value || 0)
                            }
                            prefix={"≈ $"}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />
                          {field.state.meta.errors && (
                            <p className="text-xs text-red-500 mt-1">
                              {field.state.meta.errors.join(" ")}
                            </p>
                          )}
                        </div>
                      )}
                    </form.Field>
                    <div className="text-right">
                      <div className="w-auto rounded-full h-10 px-4 border border-slate-200 bg-white shadow-sm flex items-center justify-start">
                        <div className="bg-blue-100 p-1 rounded-full mr-2">
                          <img
                            src="/bitusd.png"
                            alt="BTC"
                            className="h-5 w-5 object-cover"
                          />
                        </div>
                        <span className="font-medium">bitUSD</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LTV Slider and Borrow Button */}
                <div className="flex flex-col items-start space-y-4 mt-6">
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-slate-700">
                          Loan to Value (LTV)
                        </span>
                        <div className="relative group ml-1">
                          <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-white rounded shadow-lg text-xs text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            Ratio of the collateral value to the borrowed value.
                            Higher values mean higher risk.
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-sm font-bold ${
                            ltvValue <= 25
                              ? "text-green-600"
                              : ltvValue <= 50
                              ? "text-blue-600"
                              : ltvValue <= 70
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {ltvValue}%
                        </span>
                        <span className="text-xs text-slate-500 ml-1">
                          max. {(MAX_LTV * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      {/* Custom colored track background */}
                      <div className="absolute left-0 top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full overflow-hidden">
                        {/* Gray background for the entire track */}
                        <div className="absolute left-0 top-0 h-full w-full bg-slate-200"></div>

                        {/* Colored portion based on current value (max 90% of width) */}
                        <div
                          className={`absolute left-0 top-0 h-full ${getLtvColor(
                            ltvValue
                          )} transition-all duration-300`}
                          style={{ width: `${ltvValue * MAX_LTV}%` }}
                        ></div>

                        {/* Forbidden zone (last 20%) */}
                        <div className="absolute left-[80%] top-0 h-full w-[20%] bg-slate-300"></div>
                      </div>

                      {/* Slider component */}
                      <Slider
                        disabled={!collateralAmount || collateralAmount <= 0}
                        value={[ltvValue]}
                        onValueChange={handleLtvSliderChange}
                        max={100}
                        step={1}
                        className="z-10"
                      />
                    </div>
                  </div>

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
                <div className="space-y-3 mt-6">
                  <h3 className="text-sm font-medium text-slate-700">
                    Interest Rate
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {/* Fixed Rate Option */}
                    <div
                      className={`relative ${
                        selectedRate === "fixed"
                          ? "bg-blue-50 border-2 border-blue-500"
                          : "bg-slate-50 border-2 border-transparent hover:border-slate-200"
                      } rounded-lg p-3 cursor-pointer transition-all min-h-[60px]`}
                      onClick={() =>
                        form.setFieldValue("selectedRate", "fixed")
                      }
                    >
                      {selectedRate === "fixed" && (
                        <>
                          <div className="absolute top-2 right-2">
                            <div className="bg-blue-500 rounded-full p-1">
                              <Check className="h-2.5 w-2.5 text-white" />
                            </div>
                          </div>
                          <div className="absolute top-2 right-8">
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                              Recommended
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center mb-1">
                        <h4 className="text-base font-semibold text-slate-800">
                          Fixed (5%)
                        </h4>
                      </div>
                      <p
                        className={`text-xs text-slate-600 ${
                          selectedRate === "fixed" ? "" : "invisible"
                        }`}
                      >
                        Lock in a stable 5% interest rate for the duration of
                        your loan. Perfect for those who prefer predictable
                        payments.
                      </p>
                    </div>

                    {/* Variable Rate Option */}
                    <div
                      className={`relative ${
                        selectedRate === "variable"
                          ? "bg-blue-50 border-2 border-blue-500"
                          : "bg-slate-50 border-2 border-transparent hover:border-slate-200"
                      } rounded-lg p-3 cursor-pointer transition-all min-h-[60px]`}
                      onClick={() =>
                        form.setFieldValue("selectedRate", "variable")
                      }
                    >
                      {selectedRate === "variable" && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-blue-500 rounded-full p-1">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center mb-1">
                        <h4 className="text-base font-semibold text-slate-800">
                          Variable (4-6%)
                        </h4>
                      </div>
                      <p
                        className={`text-xs text-slate-600 ${
                          selectedRate === "variable" ? "" : "invisible"
                        }`}
                      >
                        Interest rate adjusts based on market conditions.
                        Currently averaging 4.5%. May offer lower rates than
                        fixed options.
                      </p>
                    </div>

                    {/* Self Managed Option */}
                    <div
                      className={`relative ${
                        selectedRate === "selfManaged"
                          ? "bg-blue-50 border-2 border-blue-500"
                          : "bg-slate-50 border-2 border-transparent hover:border-slate-200"
                      } rounded-lg p-3 cursor-pointer transition-all min-h-[60px]`}
                      onClick={() =>
                        form.setFieldValue("selectedRate", "selfManaged")
                      }
                    >
                      {selectedRate === "selfManaged" && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-blue-500 rounded-full p-1">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center mb-1">
                        <h4 className="text-base font-semibold text-slate-800">
                          Self Managed ({selfManagedRate}%)
                        </h4>
                      </div>
                      <p
                        className={`text-xs text-slate-600 mb-3 ${
                          selectedRate === "selfManaged" ? "" : "invisible"
                        }`}
                      >
                        Take control of your interest rate by actively managing
                        your position.
                      </p>

                      {/* Interest Rate Slider */}
                      {selectedRate === "selfManaged" && (
                        <div className="mt-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium text-slate-700">
                              Interest Rate
                            </span>
                            <span className="text-xs font-bold text-blue-600">
                              {selfManagedRate}%
                            </span>
                          </div>

                          <div className="relative">
                            {/* Custom colored track background */}
                            <div className="absolute left-0 top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full overflow-hidden">
                              {/* Gray background for the entire track */}
                              <div className="absolute left-0 top-0 h-full w-full bg-slate-200"></div>

                              {/* Colored portion based on current value */}
                              <div
                                className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
                                style={{
                                  width: `${
                                    ((selfManagedRate - 0.5) / 19.5) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>

                            {/* Slider component */}
                            <Slider
                              value={[selfManagedRate]}
                              onValueChange={(value) =>
                                form.setFieldValue("selfManagedRate", value[0])
                              }
                              min={0.5}
                              max={20}
                              step={0.1}
                              className="z-10"
                            />
                          </div>

                          <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>0.5%</span>
                            <span>20%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel */}
        <div className="md:col-span-1 space-y-6">
          {/* Vault Summary Card */}
          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-slate-800">
                  Position Summary
                </CardTitle>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-slate-100 transition-colors"
                  onClick={() => {
                    setIsRefreshing(true);
                    refetchBitcoin();
                    refetchBitUSD();
                  }}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 text-slate-600 ${
                      isRefreshing ? "animate-spin" : ""
                    }`}
                    style={
                      isRefreshing ? { animationDuration: "2s" } : undefined
                    }
                  />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-3">
              {/* Health Factor and Liquidation Price */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm items-center">
                  <span className="flex items-center text-slate-700 font-medium">
                    Debt Limit
                    <div className="relative group">
                      <HelpCircle className="h-3 w-3 ml-1 text-slate-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-white rounded shadow-lg text-xs text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        The maximum amount you can borrow.
                      </div>
                    </div>
                  </span>
                  <NumericFormat
                    className="font-medium"
                    displayType="text"
                    value={debtLimit}
                    prefix={"$"}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="flex items-center text-slate-700 font-medium">
                    Health Factor
                    <div className="relative group">
                      <HelpCircle className="h-3 w-3 ml-1 text-slate-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-white rounded shadow-lg text-xs text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        Health factor indicates the safety of your position.
                        Higher is better.
                      </div>
                    </div>
                  </span>
                  <div className="flex items-center justify-between">
                    <NumericFormat
                      className="text-green-600 font-semibold"
                      displayType="text"
                      value={healthFactor}
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                    />
                  </div>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="flex items-center text-slate-700 font-medium">
                    Liquidation Price
                    <div className="relative group">
                      <HelpCircle className="h-3 w-3 ml-1 text-slate-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-white rounded shadow-lg text-xs text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        Your position will be liquidated if the price reaches
                        this level.
                      </div>
                    </div>
                  </span>

                  <NumericFormat
                    className="font-medium"
                    displayType="text"
                    value={liquidationPrice}
                    prefix={"$"}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </div>
              </div>

              <Separator className="bg-slate-200" />
            </CardContent>
            <CardFooter className="pt-0">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-b-0">
                  <AccordionTrigger className="text-sm font-medium text-slate-600 hover:text-slate-800 py-2">
                    Transaction Details
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                    {/* Placeholder for transaction details */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Gas Fee (est.)</span>
                        <span>$0.001</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transaction Time</span>
                        <span>~2 seconds</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardFooter>
          </Card>
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
