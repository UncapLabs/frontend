import { Button } from "~/components/ui/button";
import { AlertTriangle, Info } from "lucide-react";
import { ArrowIcon } from "~/components/icons/arrow-icon";
import { InterestRateSelector } from "~/components/borrow/interest-rate-selector";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { BorrowingRestrictionsAlert } from "~/components/borrow/borrowing-restrictions-alert";
import { RedemptionInfo } from "~/components/borrow/redemption-info";
import { TokenInput } from "~/components/token-input";
import { useEffect, useCallback, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import { computeDebtLimit } from "~/lib/utils/calc";
import { MAX_LIMIT } from "~/lib/contracts/constants";
import { validators } from "~/lib/validators";
import type { Route } from "./+types/borrow.$troveId.update";
import { useParams, useNavigate } from "react-router";
import { useAccount, useBalance } from "@starknet-react/core";
import { MIN_DEBT } from "~/lib/contracts/constants";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { useTroveData } from "~/hooks/use-trove-data";
import { useUpdatePosition } from "~/hooks/use-update-position";
import { useQueryState, parseAsString } from "nuqs";
import { useWalletConnect } from "~/hooks/use-wallet-connect";
import { getInterestRatePercentage } from "~/lib/utils/position-helpers";
import { extractTroveId, extractBranchId } from "~/lib/utils/trove-id";
import { TransactionSummary } from "~/components/transaction-summary";
import { usePositionMetrics } from "~/hooks/use-position-metrics";
import {
  TOKENS,
  getCollateralByBranchId,
  getBalanceDecimals,
} from "~/lib/collateral";
import Big from "big.js";
import { bigintToBig } from "~/lib/decimal";

// Helper component for action toggle buttons
const ActionToggle = ({
  actions,
  activeAction,
  onActionChange,
  disabled = false,
}: {
  actions: Array<{ value: string; label: string }>;
  activeAction: string;
  onActionChange: (action: string) => void;
  disabled?: boolean;
}) => {
  const activeStyle =
    "flex-1 py-2 px-3 rounded-lg text-sm font-medium font-sora bg-token-bg-blue text-white transition-all";
  const inactiveStyle =
    "flex-1 py-2 px-3 rounded-lg text-sm font-medium font-sora text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 transition-all";

  return (
    <div className="flex gap-1">
      {actions.map((action) => (
        <button
          key={action.value}
          type="button"
          onClick={() => onActionChange(action.value)}
          disabled={disabled}
          className={
            activeAction === action.value ? activeStyle : inactiveStyle
          }
        >
          {action.label}
        </button>
      ))}
    </div>
  );
};

function UpdatePosition() {
  const { address } = useAccount();
  const { troveId } = useParams();
  const navigate = useNavigate();
  const { connectWallet } = useWalletConnect();

  // Fetch existing position data
  const { position } = useTroveData(troveId);

  // Zombie trove detection
  const isZombie = !!(
    position &&
    position.status === "redeemed" &&
    position.borrowedAmount.gt(0) &&
    position.borrowedAmount.lt(MIN_DEBT)
  );
  const isFullyRedeemed = !!(
    position &&
    position.status === "redeemed" &&
    position.borrowedAmount.eq(0)
  );
  const hasBeenRedeemed = !!(position && position.status === "redeemed");

  // Get collateral based on position ID
  const branchId = extractBranchId(position?.id);
  const collateral =
    branchId !== undefined ? getCollateralByBranchId(branchId) : undefined;

  // Use default collateral if not found
  const selectedCollateral = collateral || getCollateralByBranchId(0)!;

  // Use local state for amounts with Big.js for precision
  const [collateralAmount, setCollateralAmount] = useState<Big | undefined>(
    undefined
  );
  const [borrowAmount, setBorrowAmount] = useState<Big | undefined>(undefined);
  const [interestRate, setInterestRate] = useState<Big | undefined>(undefined);

  // Action state for collateral and debt
  const [collateralAction, setCollateralAction] = useQueryState(
    "collateralAction",
    parseAsString.withDefault("add")
  );
  const [debtAction, setDebtAction] = useQueryState(
    "debtAction",
    parseAsString.withDefault("borrow")
  );

  // // Get rate mode from URL
  // const [rateMode] = useQueryState("rateMode", {
  //   defaultValue: "advanced" as const,
  // });

  // Balance for selected token
  // For tokens with underlying, query the underlying token balance
  // For other tokens, query the collateral token balance
  const balanceTokenAddress = selectedCollateral.underlyingToken
    ? selectedCollateral.underlyingToken.address
    : selectedCollateral.address;

  const { data: bitcoinBalance } = useBalance({
    token: balanceTokenAddress,
    address: address,
    refetchInterval: 30000,
  });

  const { data: usduBalance } = useBalance({
    token: TOKENS.USDU.address,
    address: address,
    refetchInterval: 30000,
  });

  const { bitcoin, usdu } = useFetchPrices({
    collateralType: selectedCollateral.id,
    enabled: position !== undefined,
  });

  const minCollateralizationRatio =
    selectedCollateral.minCollateralizationRatio;

  // Calculate target amounts based on user input
  const getTargetCollateral = () => {
    if (!collateralAmount || collateralAmount.eq(0)) {
      return position?.collateralAmount || new Big(0);
    }
    if (!position) return new Big(0);
    return collateralAction === "add"
      ? position.collateralAmount.plus(collateralAmount)
      : position.collateralAmount.minus(collateralAmount);
  };

  const getTargetDebt = () => {
    if (!borrowAmount || borrowAmount.eq(0)) {
      return position?.borrowedAmount || new Big(0);
    }
    if (!position) return new Big(0);
    return debtAction === "borrow"
      ? position.borrowedAmount.plus(borrowAmount)
      : position.borrowedAmount.minus(borrowAmount);
  };

  const targetCollateral = getTargetCollateral();
  const targetDebt = getTargetDebt();

  // Calculate metrics for current position (for previous liquidation price)
  const previousMetrics = usePositionMetrics({
    collateralAmount: position?.collateralAmount || new Big(0),
    borrowAmount: position?.borrowedAmount || new Big(0),
    bitcoinPrice: bitcoin?.price,
    usduPrice: usdu?.price,
    minCollateralizationRatio,
  });

  // Calculate metrics for target position (for new liquidation price)
  const metrics = usePositionMetrics({
    collateralAmount: targetCollateral,
    borrowAmount: targetDebt,
    bitcoinPrice: bitcoin?.price,
    usduPrice: usdu?.price,
    minCollateralizationRatio,
  });

  // Initialize form with empty values using Big for precision
  const form = useForm({
    defaultValues: {
      collateralAmount: undefined as Big | undefined,
      borrowAmount: undefined as Big | undefined,
      interestRate:
        interestRate ??
        (position ? getInterestRatePercentage(position) : new Big(5)),
    },
    onSubmit: async ({ value }) => {
      if (!address) {
        toast.error("Please connect your wallet");
        return;
      }

      // Allow submission if at least one field has been changed
      const hasCollateralInput =
        value.collateralAmount && value.collateralAmount.gt(0);
      const hasBorrowInput = value.borrowAmount && value.borrowAmount.gt(0);
      const hasInterestInput =
        value.interestRate &&
        position &&
        !value.interestRate.eq(getInterestRatePercentage(position));

      if (!hasCollateralInput && !hasBorrowInput && !hasInterestInput) {
        toast.error("Please make at least one change to update your position");
        return;
      }

      if (!isReady) {
        toast.error("No changes detected");
        return;
      }

      try {
        await send();
      } catch (error) {
        console.error("Transaction error:", error);
      }
    },
  });

  // Initialize interest rate from position when it loads
  useEffect(() => {
    if (position && interestRate === undefined) {
      setInterestRate(getInterestRatePercentage(position));
    }
  }, [position, interestRate]);

  const {
    send,
    isPending,
    isSending,
    error: transactionError,
    transactionHash,
    isReady,
    currentState,
    formData,
    changes,
  } = useUpdatePosition({
    position,
    collateralAmount:
      collateralAmount && collateralAmount.gt(0) ? targetCollateral : undefined,
    borrowAmount: borrowAmount && borrowAmount.gt(0) ? targetDebt : undefined,
    interestRate: interestRate ?? new Big(5),
    collateralToken: selectedCollateral,
  });

  // Revalidate fields when wallet connection changes
  useEffect(() => {
    if (address) {
      if (collateralAmount && collateralAmount.gt(0)) {
        form.validateField("collateralAmount", "change");
      }
      if (borrowAmount && borrowAmount.gt(0)) {
        form.validateField("borrowAmount", "change");
      }
    }
  }, [address]);

  const handleComplete = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <>
      <div className="flex justify-between pb-6 items-baseline">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]">
          Update Position
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
              successTitle="Position Updated!"
              successSubtitle="Your position has been updated successfully."
              details={
                formData.collateralAmount &&
                formData.borrowAmount &&
                transactionHash
                  ? ([
                      {
                        label: "Final Collateral",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={formData.collateralAmount.toString()}
                              thousandSeparator=","
                              decimalScale={7}
                              fixedDecimalScale={false}
                            />{" "}
                            {selectedCollateral.symbol}
                          </>
                        ),
                      },
                      {
                        label: "Final Debt",
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
                      changes?.hasCollateralChange && {
                        label: changes.isCollIncrease
                          ? "Collateral Added"
                          : "Collateral Withdrawn",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={bigintToBig(
                                changes.collateralChange,
                                18
                              ).toString()}
                              thousandSeparator=","
                              decimalScale={7}
                              fixedDecimalScale={false}
                            />{" "}
                            {selectedCollateral.symbol}
                          </>
                        ),
                      },
                      changes?.hasDebtChange && {
                        label: changes.isDebtIncrease
                          ? "Borrowed More"
                          : "Debt Repaid",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={bigintToBig(
                                changes.debtChange,
                                18
                              ).toString()}
                              thousandSeparator=","
                              decimalScale={2}
                              fixedDecimalScale
                            />{" "}
                            USDU
                          </>
                        ),
                      },
                    ].filter(Boolean) as any)
                  : undefined
              }
              onComplete={handleComplete}
              completeButtonText="Back to Dashboard"
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

              <BorrowingRestrictionsAlert
                collateralType={selectedCollateral.id}
              />

              {/* Redemption History Alert - Show for all redeemed troves */}
              {hasBeenRedeemed && position && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        Position Has Been Partially Redeemed
                      </h3>
                      <div className="space-y-2 text-sm text-blue-800">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-blue-700">Redemptions: </span>
                            <span className="font-medium">
                              {position.redemptionCount?.toString() || "0"} time
                              {position.redemptionCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div>
                            <span className="text-blue-700">
                              Total Redeemed Debt:{" "}
                            </span>
                            <span className="font-medium">
                              <NumericFormat
                                displayType="text"
                                value={position.redeemedDebt?.toString() || "0"}
                                thousandSeparator=","
                                decimalScale={2}
                                fixedDecimalScale
                              />{" "}
                              USDU
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-blue-700">
                            Total Redeemed Collateral:{" "}
                          </span>
                          <span className="font-medium">
                            <NumericFormat
                              displayType="text"
                              value={position.redeemedColl?.toString() || "0"}
                              thousandSeparator=","
                              decimalScale={7}
                              fixedDecimalScale={false}
                            />{" "}
                            {selectedCollateral.symbol}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Zombie Trove Warning - Only for zombie troves */}
              {isZombie && position && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900 mb-2">
                        🧟 Zombie Position - Update Restrictions
                      </h3>
                      <p className="text-sm text-amber-800 mb-3">
                        Your position is below the minimum debt threshold due to
                        redemptions. You have limited options:
                      </p>
                      <ul className="text-sm text-amber-800 space-y-1 ml-4 list-disc">
                        <li>
                          Borrow at least{" "}
                          <span className="font-semibold">
                            {new Big(MIN_DEBT)
                              .minus(position.borrowedAmount)
                              .toFixed(2)}{" "}
                            USDU
                          </span>{" "}
                          to restore normal status
                        </li>
                        <li>
                          Add or remove collateral (maintaining valid
                          collateralization)
                        </li>
                        <li>Close the position entirely</li>
                      </ul>
                      <div className="mt-3 pt-3 border-t border-amber-200">
                        <p className="text-xs text-amber-700">
                          <strong>Note:</strong> You cannot reduce debt below{" "}
                          {MIN_DEBT} USDU. Interest rate changes are allowed
                          when increasing debt to {MIN_DEBT}+ USDU.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Fully Redeemed Notice */}
              {isFullyRedeemed && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-800 mb-2">
                        Position Fully Redeemed
                      </h3>
                      <p className="text-sm text-yellow-700">
                        Your position has no remaining debt and can be closed to
                        withdraw your collateral.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div
                className={`space-y-1 ${
                  isSending || isPending ? "opacity-75" : ""
                }`}
              >
                {/* Update Collateral */}
                <form.Field
                  name="collateralAmount"
                  asyncDebounceMs={300}
                  validators={{
                    onChangeAsync: async ({ value, fieldApi }) => {
                      if (!address || !value || !position) return undefined;

                      const currentCollateral = position.collateralAmount;
                      const currentDebt = position.borrowedAmount;

                      if (collateralAction === "add") {
                        // Adding collateral - check wallet balance
                        if (!bitcoinBalance) return undefined;

                        // Use underlying decimals for wrapped tokens
                        const balanceDecimals =
                          getBalanceDecimals(selectedCollateral);
                        const balance = bigintToBig(
                          bitcoinBalance.value,
                          balanceDecimals
                        );

                        if (value.gt(balance)) {
                          return `Insufficient balance. You have ${balance.toFixed(
                            7
                          )} ${selectedCollateral.symbol}`;
                        }

                        // Check max limit for total collateral
                        const totalCollateral = currentCollateral.plus(value);
                        return validators.compose(
                          validators.maximumAmount(
                            totalCollateral,
                            new Big(MAX_LIMIT)
                          )
                        );
                      } else {
                        // Withdrawing collateral
                        if (value.gt(currentCollateral)) {
                          return `Cannot withdraw more than current collateral (${currentCollateral.toFixed(
                            7
                          )} ${selectedCollateral.symbol})`;
                        }

                        // Check minimum collateral ratio after withdrawal
                        const newTotalCollateral =
                          currentCollateral.minus(value);

                        if (
                          bitcoin?.price &&
                          usdu?.price &&
                          currentDebt.gt(0)
                        ) {
                          // Get the current debt action value from the form
                          const formDebtAction =
                            fieldApi.form.getFieldValue("borrowAmount");

                          // Calculate final debt based on debt action
                          // If no debt action specified, use current debt
                          let finalDebt = currentDebt;
                          if (formDebtAction && formDebtAction.gt(0)) {
                            finalDebt =
                              debtAction === "borrow"
                                ? currentDebt.plus(formDebtAction)
                                : currentDebt.minus(formDebtAction);
                          }

                          const newCollateralValue = newTotalCollateral.times(
                            bitcoin.price
                          );
                          const debtValue = finalDebt.times(usdu.price);
                          const ratioError = validators.minimumCollateralRatio(
                            newCollateralValue,
                            debtValue,
                            new Big(minCollateralizationRatio)
                          );
                          if (ratioError) return ratioError;
                        }
                      }

                      return undefined;
                    },
                  }}
                  listeners={{
                    onChangeDebounceMs: 500,
                    onChange: ({ fieldApi }) => {
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
                      token={selectedCollateral}
                      balance={bitcoinBalance}
                      price={bitcoin}
                      value={field.state.value}
                      onChange={(value) => {
                        field.handleChange(value);
                        setCollateralAmount(value);
                      }}
                      onBalanceClick={
                        collateralAction === "add"
                          ? () => {
                              // Use underlying decimals for wrapped tokens
                              const balanceDecimals =
                                getBalanceDecimals(selectedCollateral);
                              const balanceBig = bitcoinBalance?.value
                                ? bigintToBig(
                                    bitcoinBalance.value,
                                    balanceDecimals
                                  )
                                : new Big(0);
                              field.handleChange(balanceBig);
                              setCollateralAmount(balanceBig);
                            }
                          : undefined
                      }
                      onBlur={field.handleBlur}
                      label={
                        collateralAction === "add"
                          ? "Increase collateral"
                          : "Decrease collateral"
                      }
                      placeholder="0"
                      disabled={isSending || isPending}
                      percentageButtons
                      onPercentageClick={() => {}} // Dummy function since we're replacing buttons
                      customPercentageButtons={
                        <ActionToggle
                          actions={[
                            { value: "add", label: "Deposit" },
                            { value: "withdraw", label: "Withdraw" },
                          ]}
                          activeAction={collateralAction}
                          onActionChange={setCollateralAction}
                          disabled={isSending || isPending}
                        />
                      }
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

                {/* Update Debt */}
                <form.Field
                  name="borrowAmount"
                  asyncDebounceMs={300}
                  validators={{
                    onChangeAsync: async ({ value, fieldApi }) => {
                      if (!value || !position) return undefined;

                      const currentDebt = position.borrowedAmount;
                      const usduBal = usduBalance
                        ? bigintToBig(usduBalance.value, TOKENS.USDU.decimals)
                        : new Big(0);

                      if (debtAction === "borrow") {
                        // Borrowing more - value is amount to borrow
                        const newTotalDebt = currentDebt.plus(value);

                        // Check zombie trove restrictions
                        const zombieError = validators.zombieTroveDebt(
                          newTotalDebt,
                          currentDebt,
                          new Big(MIN_DEBT),
                          isZombie
                        );
                        if (zombieError) return zombieError;

                        // Don't validate until prices are loaded
                        if (!bitcoin?.price || !usdu?.price) return undefined;

                        // Get collateral action value
                        const formCollateralAction =
                          fieldApi.form.getFieldValue("collateralAmount");

                        // Calculate final collateral based on collateral action
                        // If no collateral action specified, use current collateral
                        let finalCollateral = position.collateralAmount;
                        if (
                          formCollateralAction &&
                          formCollateralAction.gt(0)
                        ) {
                          finalCollateral =
                            collateralAction === "add"
                              ? position.collateralAmount.plus(
                                  formCollateralAction
                                )
                              : position.collateralAmount.minus(
                                  formCollateralAction
                                );
                        }

                        // Calculate debt limit with proper collateralization ratio
                        const debtLimit = finalCollateral.gt(0)
                          ? computeDebtLimit(
                              finalCollateral,
                              bitcoin.price,
                              minCollateralizationRatio
                            )
                          : new Big(0);

                        return validators.compose(
                          validators.minimumUsdValue(
                            newTotalDebt,
                            usdu.price,
                            new Big(200)
                          ),
                          validators.minimumDebt(
                            newTotalDebt.times(usdu.price)
                          ),
                          validators.debtLimit(newTotalDebt, debtLimit)
                        );
                      } else {
                        // Repaying debt - value is amount to repay
                        if (value.gt(currentDebt)) {
                          return `Cannot repay more than current debt (${currentDebt.toFixed(
                            2
                          )} USDU)`;
                        }

                        // Check if have enough USDU balance to repay
                        if (value.gt(usduBal)) {
                          return `Insufficient USDU balance. You have ${usduBal.toFixed(
                            2
                          )} USDU`;
                        }

                        const newTotalDebt = currentDebt.minus(value);
                        const minDebtBig = new Big(MIN_DEBT);

                        // Check zombie trove restrictions
                        if (newTotalDebt.gt(0) && newTotalDebt.lt(minDebtBig)) {
                          if (isZombie) {
                            return `Must either repay all debt or keep debt above ${MIN_DEBT} USDU`;
                          }
                          return `Debt must be either 0 or at least ${MIN_DEBT} USDU`;
                        }

                        // No need for collateral ratio check when repaying
                      }

                      return undefined;
                    },
                  }}
                  listeners={{
                    onChange: ({ fieldApi }) => {
                      const currentCollateralAmount =
                        fieldApi.form.getFieldValue("collateralAmount");
                      if (
                        currentCollateralAmount !== undefined &&
                        currentCollateralAmount.gt(0)
                      ) {
                        fieldApi.form.validateField(
                          "collateralAmount",
                          "change"
                        );
                      }
                    },
                  }}
                >
                  {(field) => (
                    <TokenInput
                      token={TOKENS.USDU}
                      balance={usduBalance}
                      price={usdu}
                      value={field.state.value}
                      onChange={(value) => {
                        field.handleChange(value);
                        setBorrowAmount(value);
                      }}
                      onBalanceClick={() => {
                        if (debtAction === "repay") {
                          // For repay: calculate max amount user can repay
                          const usduBal = usduBalance?.value
                            ? bigintToBig(
                                usduBalance.value,
                                TOKENS.USDU.decimals
                              )
                            : new Big(0);
                          const currentDebt =
                            position?.borrowedAmount || new Big(0);

                          // Maximum they can repay is current debt minus MIN_DEBT (must leave 200)
                          const minDebtBig = new Big(MIN_DEBT);
                          const maxAllowedRepay = currentDebt
                            .minus(minDebtBig)
                            .gt(0)
                            ? currentDebt.minus(minDebtBig)
                            : new Big(0);

                          // But they're also limited by their USDU balance
                          const maxRepay = usduBal.lt(maxAllowedRepay)
                            ? usduBal
                            : maxAllowedRepay;

                          field.handleChange(maxRepay);
                          setBorrowAmount(maxRepay);
                        }
                        // For borrow action, clicking balance doesn't do anything
                        // since we don't show USDU balance when borrowing
                      }}
                      onBlur={field.handleBlur}
                      label={
                        debtAction === "borrow"
                          ? "Increase debt"
                          : "Decrease debt"
                      }
                      placeholder="0"
                      disabled={isSending || isPending}
                      percentageButtons
                      onPercentageClick={() => {}} // Dummy function since we're replacing buttons
                      customPercentageButtons={
                        <ActionToggle
                          actions={[
                            { value: "borrow", label: "Borrow" },
                            { value: "repay", label: "Repay" },
                          ]}
                          activeAction={debtAction}
                          onActionChange={setDebtAction}
                          disabled={isSending || isPending}
                        />
                      }
                      tokenSelectorBgColor="bg-token-bg-red/10"
                      tokenSelectorTextColor="text-token-bg-red"
                    />
                  )}
                </form.Field>

                {/* Interest Rate Section */}
                <div className="space-y-4">
                  <InterestRateSelector
                    interestRate={
                      interestRate ? Number(interestRate.toString()) : 5
                    }
                    onInterestRateChange={(rate) => {
                      if (!isSending && !isPending) {
                        const rateBig = new Big(rate);
                        form.setFieldValue("interestRate", rateBig);
                        setInterestRate(rateBig);
                      }
                    }}
                    disabled={
                      isSending ||
                      isPending ||
                      (isZombie && borrowAmount && borrowAmount.lt(MIN_DEBT))
                    }
                    borrowAmount={borrowAmount}
                    collateralAmount={collateralAmount}
                    collateralPriceUSD={bitcoin?.price}
                    collateralType={selectedCollateral.id}
                    lastInterestRateAdjTime={position?.lastInterestRateAdjTime}
                    currentInterestRate={
                      position
                        ? Number(getInterestRatePercentage(position).toString())
                        : undefined
                    }
                    isZombie={isZombie}
                  />

                  {/* Interest Rate Lock Notice for Zombie Troves */}
                  {isZombie && (!borrowAmount || borrowAmount.lt(MIN_DEBT)) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-700">
                        <strong>Interest rate is locked</strong> - To change the
                        interest rate, increase your debt to at least {MIN_DEBT}{" "}
                        USDU in the field above.
                      </p>
                    </div>
                  )}

                  {/* Interest Rate Unlock Notice for Zombie Troves restoring debt */}
                  {isZombie && borrowAmount && borrowAmount.gte(MIN_DEBT) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-green-700">
                        <strong>Interest rate unlocked!</strong> - You can now
                        change your interest rate since you're restoring debt
                        above {MIN_DEBT} USDU.
                      </p>
                    </div>
                  )}
                </div>

                {/* Update Button */}
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
                    {({ canSubmit, collateralErrors, borrowErrors }) => {
                      let buttonText = "Update Position";

                      if (!address) {
                        buttonText = "Connect Wallet";
                      } else if (
                        !changes ||
                        (!changes.hasCollateralChange &&
                          !changes.hasDebtChange &&
                          !changes.hasInterestRateChange)
                      ) {
                        buttonText = "No changes made";
                      } else if (collateralErrors.length > 0) {
                        buttonText = collateralErrors[0];
                      } else if (borrowErrors.length > 0) {
                        buttonText = borrowErrors[0];
                      }

                      return (
                        <Button
                          type={address ? "submit" : "button"}
                          onClick={!address ? connectWallet : undefined}
                          disabled={
                            address &&
                            (isSending ||
                              isPending ||
                              !canSubmit ||
                              !changes ||
                              (!changes.hasCollateralChange &&
                                !changes.hasDebtChange &&
                                !changes.hasInterestRateChange))
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
            type="update"
            changes={{
              collateral: {
                from: position?.collateralAmount || new Big(0),
                to: targetCollateral,
                token: selectedCollateral.symbol,
              },
              collateralValueUSD: bitcoin?.price
                ? {
                    from: position
                      ? position.collateralAmount.times(bitcoin.price)
                      : new Big(0),
                    to: targetCollateral.times(bitcoin.price),
                  }
                : undefined,
              debt: {
                from: position?.borrowedAmount || new Big(0),
                to: targetDebt,
              },
              interestRate: {
                from: position
                  ? getInterestRatePercentage(position)
                  : new Big(5),
                to:
                  interestRate ||
                  (position ? getInterestRatePercentage(position) : new Big(5)),
              },
            }}
            liquidationPrice={metrics.liquidationPrice}
            previousLiquidationPrice={previousMetrics.liquidationPrice}
            collateralType={selectedCollateral.id}
            troveId={position ? extractTroveId(position.id) : undefined}
            warnings={
              collateralAction === "withdraw" &&
              collateralAmount &&
              position &&
              collateralAmount.gte(position.collateralAmount)
                ? [
                    <>
                      You're withdrawing all your collateral. Consider{" "}
                      <a
                        href={`/unanim/borrow/${troveId}/close`}
                        className="underline hover:text-amber-900 font-semibold"
                      >
                        closing your position
                      </a>{" "}
                      instead.
                    </>,
                  ]
                : []
            }
          />
          <RedemptionInfo variant="inline" />
        </div>
      </div>
    </>
  );
}

export default UpdatePosition;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Update Position - Uncap" },
    { name: "description", content: "Update your Uncap borrowing position" },
  ];
}
