import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ArrowDown } from "lucide-react";
import { InterestRateSelector, LtvSlider } from "~/components/borrow";
import { TokenInput, type Token } from "~/components/token-input";
import { useMemo, useEffect } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { type BorrowFormData } from "~/types/borrow";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import { useFormCalculations } from "~/hooks/use-form-calculations";
import { MAX_LIMIT, MAX_LTV } from "~/lib/utils/calc";
import { validators } from "~/lib/validators";
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
import { NumericFormat } from "react-number-format";

interface BorrowFormProps {
  mode: "new" | "adjust";
  troveData?: {
    collateral: number;
    debt: number;
    annualInterestRate: bigint;
  };
  onSubmit: (values: BorrowFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string;
  selectedCollateralToken?: Token;
  onCollateralTokenChange?: (token: Token) => void;
  changes?: {
    hasCollateralChange: boolean;
    hasDebtChange: boolean;
    isCollIncrease: boolean;
    isDebtIncrease: boolean;
    collateralChange: bigint;
    debtChange: bigint;
  };
}

export function BorrowForm({
  mode,
  troveData,
  onSubmit,
  isSubmitting = false,
  submitButtonText: customSubmitText,
  selectedCollateralToken = TBTC_TOKEN,
  onCollateralTokenChange,
  changes,
}: BorrowFormProps) {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as StarknetkitConnector[],
  });

  // Available collateral tokens
  const collateralTokens = [TBTC_TOKEN, LBTC_TOKEN];

  const { data: bitcoinBalance } = useBalance({
    token: selectedCollateralToken.address as `0x${string}`,
    address: address,
    refetchInterval: 30000,
  });

  const { data: bitUsdBalance } = useBalance({
    token: BITUSD_TOKEN.address,
    address: address,
    refetchInterval: 30000,
  });

  // Create properly typed default values
  const defaultValues: BorrowFormData = useMemo(
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
    defaultValues,
    onSubmit: async ({ value }) => {
      if (!value.collateralAmount || !value.borrowAmount) {
        return;
      }
      await onSubmit(value);
    },
  });

  // Reset form when trove data loads (for adjust mode)
  useEffect(() => {
    if (mode === "adjust" && troveData) {
      form.reset(defaultValues);
    }
  }, [troveData, mode, defaultValues, form]);

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

  // Revalidate fields when wallet connection changes
  useEffect(() => {
    if (address) {
      if (collateralAmount !== undefined && collateralAmount > 0) {
        form.validateField("collateralAmount", "change");
      }
      if (borrowAmount !== undefined && borrowAmount > 0) {
        form.validateField("borrowAmount", "change");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Conditional price fetching
  const { bitcoin, bitUSD } = useFetchPrices(collateralAmount);

  // Use form calculations hook
  const { ltvValue, debtLimit, computeBorrowFromLTV } = useFormCalculations(
    collateralAmount,
    borrowAmount,
    bitcoin?.price,
    bitUSD?.price
  );

  // Get form validation state
  const canSubmit = useStore(form.store, (state) => state.canSubmit);

  // Get field-specific errors
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
    if (customSubmitText && isSubmitting) {
      return customSubmitText;
    }

    if (!address) {
      return "Connect Wallet";
    }

    if (
      mode === "adjust" &&
      changes &&
      !changes.hasCollateralChange &&
      !changes.hasDebtChange
    ) {
      return "No changes made";
    }

    if (collateralErrors.length > 0) {
      return collateralErrors[0];
    }

    if (borrowErrors.length > 0) {
      return borrowErrors[0];
    }

    if (!collateralAmount) {
      return mode === "new" ? "Deposit collateral" : "Enter collateral amount";
    }

    if (!borrowAmount) {
      return "Enter borrow amount";
    }

    return mode === "new" ? "Borrow" : "Adjust Position";
  }, [
    address,
    mode,
    collateralAmount,
    borrowAmount,
    collateralErrors,
    borrowErrors,
    changes,
    customSubmitText,
    isSubmitting,
  ]);

  // Handlers
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
      const maxAvailable =
        mode === "adjust" ? currentCollateral + balance : balance;
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

  const connectWallet = async () => {
    const { connector } = await starknetkitConnectModal();
    if (!connector) {
      return;
    }
    connect({ connector: connector as Connector });
  };

  // Helper text for adjust mode
  const getHelperText = (
    field: "collateral" | "debt",
    currentValue?: number,
    newValue?: number
  ) => {
    if (
      mode !== "adjust" ||
      !troveData ||
      currentValue === undefined ||
      newValue === undefined
    ) {
      return undefined;
    }

    if (field === "collateral") {
      if (newValue > currentValue) {
        return `Adding ${(newValue - currentValue).toFixed(7)} ${
          selectedCollateralToken.symbol
        }`;
      } else if (newValue < currentValue) {
        return `Withdrawing ${(currentValue - newValue).toFixed(7)} ${
          selectedCollateralToken.symbol
        }`;
      }
      return "No change";
    } else {
      if (newValue > currentValue) {
        return `Borrowing ${(newValue - currentValue).toFixed(2)} bitUSD more`;
      } else if (newValue < currentValue) {
        return `Repaying ${(currentValue - newValue).toFixed(2)} bitUSD`;
      }
      return "No change";
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Card
        className={`border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
          isSubmitting ? "opacity-75" : ""
        }`}
      >
        <CardContent className="pt-6 space-y-6">
          {/* Current Position Info (adjust mode only) */}
          {mode === "adjust" && troveData && (
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
          )}

          {/* Collateral Section */}
          <form.Field
            name="collateralAmount"
            validators={{
              onChange: ({ value }) => {
                if (!address || !value) return undefined;

                const balance = bitcoinBalance
                  ? Number(bitcoinBalance.value) /
                    10 ** selectedCollateralToken.decimals
                  : 0;

                if (mode === "adjust" && troveData) {
                  const currentCollateral = troveData.collateral;
                  const currentDebt = troveData.debt;

                  // Check if withdrawing
                  if (value < currentCollateral) {
                    const withdrawAmount = currentCollateral - value;
                    if (withdrawAmount > currentCollateral) {
                      return "Cannot withdraw more than current collateral";
                    }

                    // Check minimum collateral ratio after withdrawal
                    if (bitcoin?.price && bitUSD?.price && currentDebt > 0) {
                      const newCollateralValue = value * bitcoin.price;
                      const debtValue = currentDebt * bitUSD.price;
                      const ratioError = validators.minimumCollateralRatio(
                        newCollateralValue,
                        debtValue,
                        1.1 // 110% minimum
                      );
                      if (ratioError) return ratioError;
                    }
                  }

                  // Check if adding
                  if (
                    value > currentCollateral &&
                    value - currentCollateral > balance
                  ) {
                    return `Insufficient balance. You have ${balance.toFixed(
                      7
                    )} ${selectedCollateralToken.symbol}`;
                  }
                } else {
                  return validators.compose(
                    validators.insufficientBalance(value, balance),
                    validators.maximumAmount(value, MAX_LIMIT)
                  );
                }

                return validators.maximumAmount(value, MAX_LIMIT);
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
                tokens={mode === "new" ? collateralTokens : undefined}
                onTokenChange={
                  mode === "new" && onCollateralTokenChange
                    ? (token) => {
                        onCollateralTokenChange(token);
                        field.handleChange(undefined); // Reset amount when token changes
                      }
                    : undefined
                }
                balance={bitcoinBalance}
                price={bitcoin}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                label={mode === "new" ? "You deposit" : "Collateral"}
                percentageButtons
                onPercentageClick={(percentage: number) =>
                  handlePercentageClick(percentage, "collateral")
                }
                error={field.state.meta.errors?.[0]}
                disabled={isSubmitting}
                showBalance={true}
                helperText={getHelperText(
                  "collateral",
                  troveData?.collateral,
                  field.state.value
                )}
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

          {/* Debt Section */}
          <form.Field
            name="borrowAmount"
            validators={{
              onChange: ({ value, fieldApi }) => {
                if (!value) return undefined;

                const collateral =
                  fieldApi.form.getFieldValue("collateralAmount");

                if (mode === "adjust" && troveData) {
                  const currentDebt = troveData.debt;
                  const bitUsdBal = bitUsdBalance
                    ? Number(bitUsdBalance.value) / 10 ** BITUSD_TOKEN.decimals
                    : 0;

                  if (value < currentDebt && currentDebt - value > bitUsdBal) {
                    return `Insufficient bitUSD balance. You have ${bitUsdBal.toFixed(
                      2
                    )} bitUSD`;
                  }
                }

                return validators.compose(
                  mode === "new"
                    ? validators.requiresCollateral(value, collateral)
                    : undefined,
                  validators.minimumUsdValue(value, bitUSD?.price || 1, 2000),
                  validators.minimumDebt(value * (bitUSD?.price || 1)),
                  validators.debtLimit(value, debtLimit),
                  // LTV check
                  (() => {
                    if (!collateral || !bitcoin?.price || !bitUSD?.price)
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
                balance={mode === "adjust" ? bitUsdBalance : undefined}
                price={bitUSD}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                label={mode === "new" ? "You borrow" : "Debt"}
                percentageButtons
                percentageButtonsOnHover
                onPercentageClick={(percentage: number) =>
                  handlePercentageClick(percentage, "borrow")
                }
                percentageButtonsDisabled={
                  !debtLimit || debtLimit <= 0 || isSubmitting
                }
                error={field.state.meta.errors?.[0]}
                disabled={isSubmitting}
                showBalance={mode === "adjust"}
                helperText={getHelperText(
                  "debt",
                  troveData?.debt,
                  field.state.value
                )}
              />
            )}
          </form.Field>

          {/* LTV Slider and Submit Button */}
          <div className="flex flex-col items-start space-y-4 mt-6">
            <LtvSlider
              ltvValue={ltvValue}
              onValueChange={handleLtvSliderChange}
              disabled={
                !collateralAmount || collateralAmount <= 0 || isSubmitting
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
                  isSubmitting ||
                  !canSubmit ||
                  (mode === "adjust" &&
                    changes &&
                    !changes.hasCollateralChange &&
                    !changes.hasDebtChange))
              }
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-6 rounded-xl shadow-sm hover:shadow transition-all whitespace-nowrap"
            >
              {isSubmitting
                ? mode === "new"
                  ? "Confirm in wallet..."
                  : "Adjusting..."
                : buttonText}
            </Button>
          </div>

          {/* Interest Rate Options */}
          <InterestRateSelector
            interestRate={interestRate}
            onInterestRateChange={(rate) => {
              if (!isSubmitting) {
                form.setFieldValue("interestRate", rate);
              }
            }}
            disabled={isSubmitting}
          />
        </CardContent>
      </Card>
    </form>
  );
}
