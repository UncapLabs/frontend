import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ArrowLeft, ArrowDown } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { TokenInput } from "~/components/token-input";
import { useMemo, useEffect, useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { type BorrowFormData } from "~/types/borrow";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import { useFormCalculations } from "~/hooks/use-form-calculations";
import { MAX_LIMIT, getAnnualInterestRate } from "~/lib/utils/calc";
import { validators } from "~/lib/validators";
import type { Route } from "./+types/borrow.$troveId.update";
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

function UpdatePosition() {
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
  const [selectedTokenSymbol] = useQueryState("collateral", {
    defaultValue: TBTC_TOKEN.symbol,
  });

  // Sub-tabs state for collateral and debt
  const [collateralMode, setCollateralMode] = useState<"deposit" | "withdraw">(
    "deposit"
  );
  const [debtMode, setDebtMode] = useState<"borrow" | "repay">("borrow");

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
  const defaultBorrowFormValues: BorrowFormData = useMemo(
    () => ({
      collateralAmount: troveData?.collateral,
      borrowAmount: troveData?.debt,
      interestRate: troveData
        ? Number(troveData.annualInterestRate) /
          Number(INTEREST_RATE_SCALE_DOWN_FACTOR)
        : 5,
    }),
    [troveData]
  );

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
        interestRate:
          Number(troveData.annualInterestRate) /
          Number(INTEREST_RATE_SCALE_DOWN_FACTOR),
      });
    }
  }, [troveData]);

  // Get form values reactively
  const collateralAmount = useStore(
    form.store,
    (state) => state.values.collateralAmount
  );
  const borrowAmount = useStore(
    form.store,
    (state) => state.values.borrowAmount
  );
  const interestRate = useStore(
    form.store,
    (state) => state.values.interestRate
  );

  // Conditional price fetching
  const { bitcoin, bitUSD } = useFetchPrices(collateralAmount);

  // Use form calculations hook
  const { debtLimit } = useFormCalculations(
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
    currentInterestRate: troveData?.annualInterestRate,
    newCollateral: collateralAmount,
    newDebt: borrowAmount,
    newInterestRate: interestRate
      ? getAnnualInterestRate(interestRate)
      : undefined,
    collateralToken: selectedCollateralToken,
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

    return "Update Position";
  }, [
    address,
    collateralAmount,
    borrowAmount,
    collateralErrors,
    borrowErrors,
    changes,
  ]);

  const handleComplete = () => {
    navigate("/positions");
  };

  // Handle wallet connection
  const connectWallet = async () => {
    const { connector } = await starknetkitConnectModal();
    if (!connector) {
      return;
    }
    connect({ connector: connector as Connector });
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
          <h1 className="text-3xl font-bold mb-2 text-slate-800">
            Update Position
          </h1>
        </div>
        <Separator className="mb-8 bg-slate-200" />
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-600">Loading trove data...</p>
        </div>
      </div>
    );
  }

  // Calculate liquidation price
  const liquidationPrice = borrowAmount && collateralAmount && collateralAmount > 0
    ? (borrowAmount * 1.1) / collateralAmount
    : 0;

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/borrow/${troveId}`)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold mb-2 text-slate-800">
            Update Position #{troveId}
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
              successTitle="Position Updated!"
              successSubtitle="Your position has been updated successfully."
              details={
                changes && urlTransactionHash
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
                            bitUSD
                          </>
                        ),
                      },
                    ].filter(Boolean) as any)
                  : undefined
              }
              onComplete={handleComplete}
              completeButtonText="View Positions"
            />
          ) : (
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                >
                  <div className="space-y-6">
                    {/* Current Position Info */}
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                      <h3 className="font-medium text-slate-700">
                        Current Position
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">
                            Collateral:
                          </span>{" "}
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
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">
                          Adjust Collateral
                        </span>
                        <Tabs
                          value={collateralMode}
                          onValueChange={(v) => {
                            setCollateralMode(v as "deposit" | "withdraw");
                            // Reset to current value when switching modes
                            form.setFieldValue("collateralAmount", troveData?.collateral);
                          }}
                        >
                          <TabsList className="h-7">
                            <TabsTrigger
                              value="deposit"
                              className="text-xs px-2 py-1"
                            >
                              Deposit
                            </TabsTrigger>
                            <TabsTrigger
                              value="withdraw"
                              className="text-xs px-2 py-1"
                            >
                              Withdraw
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                      
                      {/* Show current amount */}
                      <div className="text-sm text-slate-600 mb-2">
                        Current: <span className="font-medium text-slate-800">
                          <NumericFormat
                            displayType="text"
                            value={troveData?.collateral || 0}
                            thousandSeparator=","
                            decimalScale={7}
                            fixedDecimalScale={false}
                          />{" "}
                          {selectedCollateralToken.symbol}
                        </span>
                      </div>
                      <form.Field
                        name="collateralAmount"
                        validators={{
                          onChange: ({ value }) => {
                            if (!address || !value) return undefined;

                            const balance = bitcoinBalance
                              ? Number(bitcoinBalance.value) /
                                10 ** selectedCollateralToken.decimals
                              : 0;
                            const currentCollateral =
                              troveData?.collateral || 0;
                            const currentDebt = troveData?.debt || 0;

                            // Check if withdrawing
                            if (value < currentCollateral) {
                              const withdrawAmount =
                                currentCollateral - value;
                              if (withdrawAmount > currentCollateral) {
                                return "Cannot withdraw more than current collateral";
                              }

                              // Check minimum collateral ratio after withdrawal
                              if (
                                bitcoin?.price &&
                                bitUSD?.price &&
                                currentDebt > 0
                              ) {
                                const newCollateralValue =
                                  value * bitcoin.price;
                                const debtValue =
                                  currentDebt * bitUSD.price;
                                const ratioError =
                                  validators.minimumCollateralRatio(
                                    newCollateralValue,
                                    debtValue,
                                    1.1 // 110% minimum
                                  );
                                if (ratioError) return ratioError;
                              }
                            }

                            // Check if adding more than balance
                            if (
                              value > currentCollateral &&
                              value - currentCollateral > balance
                            ) {
                              return `Insufficient balance. You have ${balance.toFixed(
                                7
                              )} ${selectedCollateralToken.symbol}`;
                            }

                            return validators.compose(
                              validators.maximumAmount(value, MAX_LIMIT)
                            );
                          },
                        }}
                        listeners={{
                          onChange: ({ fieldApi }) => {
                            if (
                              borrowAmount !== undefined &&
                              borrowAmount > 0
                            ) {
                              fieldApi.form.validateField(
                                "borrowAmount",
                                "change"
                              );
                            }
                          },
                        }}
                      >
                        {(field) => {
                          // Derive the change amount from the current form value
                          const changeAmount = field.state.value !== undefined && troveData
                            ? Math.abs(field.state.value - troveData.collateral)
                            : 0;
                          
                          return (
                            <div className="space-y-3">
                              <TokenInput
                                token={selectedCollateralToken}
                                balance={bitcoinBalance}
                                price={bitcoin}
                                value={changeAmount}
                                onChange={(value) => {
                                  // Convert change amount to total
                                  const newTotal = value !== undefined
                                    ? (collateralMode === "deposit"
                                        ? troveData.collateral + value
                                        : Math.max(0, troveData.collateral - value))
                                    : troveData.collateral;
                                  field.handleChange(newTotal);
                                }}
                                onBlur={field.handleBlur}
                                label={collateralMode === "withdraw" ? "Amount to Withdraw" : "Amount to Add"}
                                percentageButtons
                                onPercentageClick={(percentage: number) => {
                                  const currentCollateral = troveData?.collateral || 0;
                                  const balance = bitcoinBalance?.value
                                    ? Number(bitcoinBalance.value) / 10 ** selectedCollateralToken.decimals
                                    : 0;
                                  const maxAvailable = collateralMode === "deposit" ? balance : currentCollateral;
                                  const changeAmount = maxAvailable * percentage;
                                  const newTotal = collateralMode === "deposit"
                                    ? currentCollateral + changeAmount
                                    : currentCollateral - changeAmount;
                                  field.handleChange(newTotal);
                                }}
                                error={field.state.meta.errors?.[0]}
                                disabled={isSending || isPending}
                                showBalance={true}
                                placeholder="0"
                              />
                              
                              {/* Show new total if there's a change */}
                              {changeAmount > 0 && (
                                <div className="text-sm text-slate-600">
                                  New total: <span className="font-medium text-slate-800">
                                    <NumericFormat
                                      displayType="text"
                                      value={field.state.value}
                                      thousandSeparator=","
                                      decimalScale={7}
                                      fixedDecimalScale={false}
                                    />{" "}
                                    {selectedCollateralToken.symbol}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        }}
                      </form.Field>
                    </div>

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
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">
                          Adjust Debt
                        </span>
                        <Tabs
                          value={debtMode}
                          onValueChange={(v) => {
                            setDebtMode(v as "borrow" | "repay");
                            // Reset to current value when switching modes
                            form.setFieldValue("borrowAmount", troveData?.debt);
                          }}
                        >
                          <TabsList className="h-7">
                            <TabsTrigger
                              value="borrow"
                              className="text-xs px-2 py-1"
                            >
                              Borrow
                            </TabsTrigger>
                            <TabsTrigger
                              value="repay"
                              className="text-xs px-2 py-1"
                            >
                              Repay
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                      
                      {/* Show current amount */}
                      <div className="text-sm text-slate-600 mb-2">
                        Current: <span className="font-medium text-slate-800">
                          <NumericFormat
                            displayType="text"
                            value={troveData?.debt || 0}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />{" "}
                          bitUSD
                        </span>
                      </div>
                      <form.Field
                        name="borrowAmount"
                        validators={{
                          onChange: ({ value, fieldApi }) => {
                            if (!value) return undefined;

                            const collateral =
                              fieldApi.form.getFieldValue(
                                "collateralAmount"
                              ) ||
                              troveData?.collateral ||
                              0;
                            const currentDebt = troveData?.debt || 0;
                            const bitUsdBal = bitUsdBalance
                              ? Number(bitUsdBalance.value) /
                                10 ** BITUSD_TOKEN.decimals
                              : 0;

                            // Check if repaying more than available balance
                            if (value < currentDebt) {
                              const repayAmount = currentDebt - value;
                              if (repayAmount > bitUsdBal) {
                                return `Insufficient bitUSD balance. You have ${bitUsdBal.toFixed(
                                  2
                                )} bitUSD to repay ${repayAmount.toFixed(
                                  2
                                )} bitUSD`;
                              }
                            }

                            // Skip debt limit check if we're keeping the same or reducing debt
                            const isIncreasingDebt = value > currentDebt;

                            return validators.compose(
                              validators.minimumUsdValue(
                                value,
                                bitUSD?.price || 1,
                                2000
                              ),
                              validators.minimumDebt(
                                value * (bitUSD?.price || 1)
                              ),
                              // Only check debt limit when increasing debt
                              isIncreasingDebt
                                ? validators.debtLimit(value, debtLimit)
                                : undefined,
                            );
                          },
                        }}
                      >
                        {(field) => {
                          // Derive the change amount from the current form value
                          const changeAmount = field.state.value !== undefined && troveData
                            ? Math.abs(field.state.value - troveData.debt)
                            : 0;
                          
                          return (
                            <div className="space-y-3">
                              <TokenInput
                                token={BITUSD_TOKEN}
                                balance={bitUsdBalance}
                                price={bitUSD}
                                value={changeAmount}
                                onChange={(value) => {
                                  // Convert change amount to total
                                  const newTotal = value !== undefined
                                    ? (debtMode === "borrow"
                                        ? troveData.debt + value
                                        : Math.max(0, troveData.debt - value))
                                    : troveData.debt;
                                  field.handleChange(newTotal);
                                }}
                                onBlur={field.handleBlur}
                                label={debtMode === "repay" ? "Amount to Repay" : "Amount to Borrow"}
                                percentageButtons
                                percentageButtonsOnHover
                                onPercentageClick={(percentage: number) => {
                                  const currentDebt = troveData?.debt || 0;
                                  const bitUsdBal = bitUsdBalance
                                    ? Number(bitUsdBalance.value) / 10 ** BITUSD_TOKEN.decimals
                                    : 0;
                                  const maxAvailable = debtMode === "borrow" 
                                    ? Math.max(0, (debtLimit || 0) - currentDebt)
                                    : Math.min(currentDebt, bitUsdBal);
                                  const changeAmount = maxAvailable * percentage;
                                  const newTotal = debtMode === "borrow"
                                    ? currentDebt + changeAmount
                                    : currentDebt - changeAmount;
                                  field.handleChange(newTotal);
                                }}
                                percentageButtonsDisabled={
                                  !debtLimit ||
                                  debtLimit <= 0 ||
                                  isSending ||
                                  isPending
                                }
                                error={field.state.meta.errors?.[0]}
                                disabled={isSending || isPending}
                                showBalance={true}
                                placeholder="0"
                              />
                              
                              {/* Show new total if there's a change */}
                              {changeAmount > 0 && (
                                <div className="text-sm text-slate-600">
                                  New total: <span className="font-medium text-slate-800">
                                    <NumericFormat
                                      displayType="text"
                                      value={field.state.value}
                                      thousandSeparator=","
                                      decimalScale={2}
                                      fixedDecimalScale
                                    />{" "}
                                    bitUSD
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        }}
                      </form.Field>
                    </div>

                    {/* Fee Preview Section */}
                    {changes && (changes.hasCollateralChange || changes.hasDebtChange) && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                        <h4 className="font-medium text-amber-800">Transaction Preview</h4>
                        <div className="space-y-1 text-sm text-amber-700">
                          {/* TODO: Add actual fee calculations */}
                          <div className="flex justify-between">
                            <span>Estimated Fee:</span>
                            <span className="font-medium">~0.5%</span>
                          </div>
                          {liquidationPrice > 0 && (
                            <div className="flex justify-between">
                              <span>New Liquidation Price:</span>
                              <span className="font-medium">
                                <NumericFormat
                                  displayType="text"
                                  value={liquidationPrice}
                                  prefix="$"
                                  thousandSeparator=","
                                  decimalScale={2}
                                  fixedDecimalScale
                                />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Update Button */}
                    <div className="flex flex-col items-start space-y-4 mt-6">
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
                            (!changes.hasCollateralChange &&
                              !changes.hasDebtChange))
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
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Position Summary */}
        <div className="md:col-span-1">
          <Card className="border border-slate-200 shadow-sm sticky top-8">
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg text-slate-800">
                Position Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-slate-600">Collateral</span>
                  <span className="font-medium">
                    <NumericFormat
                      displayType="text"
                      value={collateralAmount || troveData.collateral}
                      thousandSeparator=","
                      decimalScale={7}
                      fixedDecimalScale={false}
                    />{" "}
                    {selectedCollateralToken.symbol}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-slate-600">Debt</span>
                  <span className="font-medium">
                    <NumericFormat
                      displayType="text"
                      value={borrowAmount || troveData.debt}
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                    />{" "}
                    bitUSD
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-slate-600">Interest Rate</span>
                  <span className="font-medium">{interestRate}%</span>
                </div>

                <Separator className="bg-slate-100" />

                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-slate-600">
                    Liquidation Price
                  </span>
                  <span className="font-medium">
                    <NumericFormat
                      displayType="text"
                      value={liquidationPrice}
                      prefix="$"
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                    />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default UpdatePosition;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Update Position - BitUSD" },
    { name: "description", content: "Update your BitUSD borrowing position" },
  ];
}