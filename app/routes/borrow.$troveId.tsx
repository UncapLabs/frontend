import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ArrowDown, ArrowLeft } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { InterestRateSelector, LtvSlider } from "~/components/borrow";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { TokenInput } from "~/components/token-input";
import { useMemo, useEffect } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { type BorrowFormData } from "~/types/borrow";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import { useFormCalculations } from "~/hooks/use-form-calculations";
import { MAX_LIMIT, MAX_LTV, getAnnualInterestRate } from "~/lib/utils/calc";
import { validators } from "~/lib/validators";
import type { Route } from "./+types/borrow.$troveId";
import { useParams, useNavigate } from "react-router";
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
import { useAdjustTrove } from "~/hooks/use-adjust-trove";
import { useTroveData } from "~/hooks/use-trove-data";
import { useQueryState } from "nuqs";

function AdjustTrove() {
  const { address } = useAccount();
  const { troveId } = useParams();
  const navigate = useNavigate();
  const { connect, connectors } = useConnect();
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as StarknetkitConnector[],
  });

  // Fetch existing trove data
  const { troveData, isLoading: isTroveLoading } = useTroveData(troveId);

  // Check if we have a transaction hash in URL
  const [urlTransactionHash, setUrlTransactionHash] = useQueryState("tx", {
    defaultValue: "",
  });

  // Available collateral tokens
  const collateralTokens = [TBTC_TOKEN, LBTC_TOKEN];

  // Store selected collateral token in URL
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useQueryState(
    "collateral",
    {
      defaultValue: TBTC_TOKEN.symbol,
    }
  );

  // Get the full token object from the symbol
  const selectedCollateralToken =
    collateralTokens.find((token) => token.symbol === selectedTokenSymbol) ||
    TBTC_TOKEN;

  const { data: bitcoinBalance } = useBalance({
    token: selectedCollateralToken.address,
    address: address,
    refetchInterval: 30000,
  });

  const { data: bitUsdBalance } = useBalance({
    token: BITUSD_TOKEN.address,
    address: address,
    refetchInterval: 30000,
  });

  // Create properly typed default values from existing trove
  const defaultBorrowFormValues: BorrowFormData = useMemo(() => ({
    collateralAmount: troveData?.collateral,
    borrowAmount: troveData?.debt,
    selectedRate: troveData ? 
      (Number(troveData.annualInterestRate) / Number(INTEREST_RATE_SCALE_DOWN_FACTOR) === 5 ? "fixed" : "self-managed") 
      : "fixed",
    selfManagedRate: troveData ? 
      Number(troveData.annualInterestRate) / Number(INTEREST_RATE_SCALE_DOWN_FACTOR) 
      : 5,
  }), [troveData]);

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

  // Reset form when trove data loads
  useEffect(() => {
    if (troveData) {
      form.reset({
        collateralAmount: troveData.collateral,
        borrowAmount: troveData.debt,
        selectedRate: Number(troveData.annualInterestRate) / Number(INTEREST_RATE_SCALE_DOWN_FACTOR) === 5 ? "fixed" : "self-managed",
        selfManagedRate: Number(troveData.annualInterestRate) / Number(INTEREST_RATE_SCALE_DOWN_FACTOR),
      });
    }
  }, [troveData, form]);

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

  // Conditional price fetching
  const { bitcoin, bitUSD } = useFetchPrices(collateralAmount);

  // Calculate annual interest rate
  const annualInterestRate = useMemo(() => {
    return getAnnualInterestRate(selectedRate, selfManagedRate);
  }, [selectedRate, selfManagedRate]);

  // Use form calculations hook
  const { ltvValue, debtLimit, computeBorrowFromLTV } = useFormCalculations(
    collateralAmount,
    borrowAmount,
    bitcoin?.price,
    bitUSD?.price
  );

  // Use the adjust trove hook
  const {
    send,
    isPending,
    isSending,
    isError: isTransactionError,
    error: transactionError,
    transactionHash,
    isReady,
    isSuccess: isTransactionSuccess,
    changes,
  } = useAdjustTrove({
    troveId: troveData?.troveId,
    currentCollateral: troveData?.collateral,
    currentDebt: troveData?.debt,
    newCollateral: collateralAmount,
    newDebt: borrowAmount,
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

    if (!changes || (!changes.hasCollateralChange && !changes.hasDebtChange)) {
      return "No changes made";
    }

    // Show specific error messages in button
    if (collateralErrors.length > 0) {
      return collateralErrors[0];
    }

    if (borrowErrors.length > 0) {
      return borrowErrors[0];
    }

    if (!collateralAmount) {
      return "Enter collateral amount";
    }

    if (!borrowAmount) {
      return "Enter borrow amount";
    }

    return "Adjust Position";
  }, [address, collateralAmount, borrowAmount, collateralErrors, borrowErrors, changes]);

  // Handlers using TanStack Form
  const handleLtvSliderChange = (value: number[]) => {
    const intendedLtvPercentage = Math.min(value[0], MAX_LTV * 100);
    const newBorrowAmount = computeBorrowFromLTV(intendedLtvPercentage);
    form.setFieldValue("borrowAmount", newBorrowAmount);
    form.validateField("borrowAmount", "change");
  };

  const handlePercentageClick = (
    percentage: number,
    type: "collateral" | "borrow"
  ) => {
    if (type === "collateral") {
      const currentCollateral = troveData?.collateral || 0;
      const balance = bitcoinBalance?.value
        ? Number(bitcoinBalance.value) / 10 ** selectedCollateralToken.decimals
        : 0;
      const maxAvailable = currentCollateral + balance;
      const newValue = maxAvailable * percentage;
      form.setFieldValue("collateralAmount", newValue);
      form.validateField("collateralAmount", "change");
    } else {
      const maxBorrowable = debtLimit;
      const newValue = maxBorrowable * percentage;
      form.setFieldValue("borrowAmount", newValue);
      form.validateField("borrowAmount", "change");
    }
  };

  const handleComplete = () => {
    navigate("/positions");
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

  if (isTroveLoading || !troveData) {
    return (
      <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="flex justify-between items-baseline">
          <h1 className="text-3xl font-bold mb-2 text-slate-800">Adjust Position</h1>
        </div>
        <Separator className="mb-8 bg-slate-200" />
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-600">Loading trove data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/positions")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold mb-2 text-slate-800">
            Adjust Position #{troveId}
          </h1>
        </div>
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
              successTitle="Position Adjusted!"
              successSubtitle="Your position has been updated successfully."
              details={
                changes && urlTransactionHash
                  ? [
                      changes.hasCollateralChange && {
                        label: changes.isCollIncrease ? "Collateral Added" : "Collateral Withdrawn",
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
                        label: changes.isDebtIncrease ? "Borrowed More" : "Debt Repaid",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={Number(changes.debtChange) / 1e18}
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
                    ].filter(Boolean) as any
                  : undefined
              }
              onComplete={handleComplete}
              completeButtonText="View Positions"
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
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <h3 className="font-medium text-slate-700">Current Position</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Collateral:</span>{" "}
                        <span className="font-medium">
                          <NumericFormat
                            displayType="text"
                            value={troveData.collateral}
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
                            value={troveData.debt}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />{" "}
                          bitUSD
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Collateral Adjustment Section */}
                  <form.Field
                    name="collateralAmount"
                    validators={{
                      onChange: ({ value }) => {
                        if (!address || !value) return undefined;

                        const balance = bitcoinBalance
                          ? Number(bitcoinBalance.value) /
                            10 ** selectedCollateralToken.decimals
                          : 0;
                        const currentCollateral = troveData?.collateral || 0;
                        const maxWithdrawable = currentCollateral;
                        
                        // Check if withdrawing more than available
                        if (value < currentCollateral && (currentCollateral - value) > maxWithdrawable) {
                          return "Cannot withdraw more than current collateral";
                        }
                        
                        // Check if adding more than balance
                        if (value > currentCollateral && (value - currentCollateral) > balance) {
                          return `Insufficient balance. You have ${balance.toFixed(7)} ${selectedCollateralToken.symbol}`;
                        }

                        return validators.compose(
                          validators.maximumAmount(value, MAX_LIMIT)
                        );
                      },
                    }}
                    listeners={{
                      onChange: ({ fieldApi }) => {
                        if (borrowAmount !== undefined && borrowAmount > 0) {
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
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        label="Collateral"
                        percentageButtons
                        onPercentageClick={(percentage: number) =>
                          handlePercentageClick(percentage, "collateral")
                        }
                        error={field.state.meta.errors?.[0]}
                        disabled={isSending || isPending}
                        showBalance={true}
                        helperText={
                          field.state.value !== undefined && troveData
                            ? field.state.value > troveData.collateral
                              ? `Adding ${(field.state.value - troveData.collateral).toFixed(7)} ${selectedCollateralToken.symbol}`
                              : field.state.value < troveData.collateral
                              ? `Withdrawing ${(troveData.collateral - field.state.value).toFixed(7)} ${selectedCollateralToken.symbol}`
                              : "No change"
                            : undefined
                        }
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

                  {/* Debt Adjustment Section */}
                  <form.Field
                    name="borrowAmount"
                    validators={{
                      onChange: ({ value, fieldApi }) => {
                        if (!value) return undefined;

                        const collateral =
                          fieldApi.form.getFieldValue("collateralAmount");
                        const currentDebt = troveData?.debt || 0;
                        const bitUsdBal = bitUsdBalance
                          ? Number(bitUsdBalance.value) / 10 ** BITUSD_TOKEN.decimals
                          : 0;

                        // Check if repaying more than available balance
                        if (value < currentDebt && (currentDebt - value) > bitUsdBal) {
                          return `Insufficient bitUSD balance. You have ${bitUsdBal.toFixed(2)} bitUSD`;
                        }

                        return validators.compose(
                          validators.minimumUsdValue(
                            value,
                            bitUSD?.price || 1,
                            2000
                          ),
                          validators.debtLimit(value, debtLimit),
                          // LTV check
                          (() => {
                            if (
                              !collateral ||
                              !bitcoin?.price ||
                              !bitUSD?.price
                            )
                              return undefined;
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
                        balance={bitUsdBalance}
                        price={bitUSD}
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        label="Debt"
                        percentageButtons
                        percentageButtonsOnHover
                        onPercentageClick={(percentage: number) =>
                          handlePercentageClick(percentage, "borrow")
                        }
                        percentageButtonsDisabled={
                          !debtLimit || debtLimit <= 0 || isSending || isPending
                        }
                        error={field.state.meta.errors?.[0]}
                        disabled={isSending || isPending}
                        showBalance={true}
                        helperText={
                          field.state.value !== undefined && troveData
                            ? field.state.value > troveData.debt
                              ? `Borrowing ${(field.state.value - troveData.debt).toFixed(2)} bitUSD more`
                              : field.state.value < troveData.debt
                              ? `Repaying ${(troveData.debt - field.state.value).toFixed(2)} bitUSD`
                              : "No change"
                            : undefined
                        }
                      />
                    )}
                  </form.Field>

                  {/* LTV Slider and Adjust Button */}
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
                          isSending ||
                          isPending ||
                          !canSubmit ||
                          !changes ||
                          (!changes.hasCollateralChange && !changes.hasDebtChange))
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
      </div>
    </div>
  );
}

export default AdjustTrove;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Adjust Position - BitUSD" },
    { name: "description", content: "Adjust your BitUSD borrowing position" },
  ];
}