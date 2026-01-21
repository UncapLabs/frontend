import { Button } from "~/components/ui/button";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { TOKENS, type CollateralId } from "~/lib/collateral";
import { NumericFormat } from "react-number-format";
import { useStabilityPoolTransaction } from "~/hooks/use-stability-pool-transaction";
import type { CollateralOutputToken } from "~/hooks/use-stability-pool";
import { validators } from "~/lib/validators";
import { WithdrawSection } from "~/components/earn/withdraw-section";
import { CollateralSwapSelector } from "~/components/earn/collateral-swap-selector";
import { ClaimRewardsToggle } from "~/components/earn/claim-rewards-toggle";
import Big from "big.js";
import { bigintToBig } from "~/lib/decimal";

interface GetWithdrawButtonTextParams {
  address: string | undefined;
  errors: string[];
  amount: Big | null;
  hasDeposit: boolean;
  hasRewards: boolean;
  claimRewards: boolean;
  isSwappingToUsdu: boolean;
  isSending: boolean;
  isPending: boolean;
  isQuoteLoading: boolean;
  quoteError: boolean;
}

function getWithdrawButtonText(params: GetWithdrawButtonTextParams): string {
  const {
    address,
    errors,
    amount,
    hasDeposit,
    hasRewards,
    claimRewards,
    isSwappingToUsdu,
    isSending,
    isPending,
    isQuoteLoading,
    quoteError,
  } = params;

  if (isSending) return "Confirm in wallet...";
  if (isPending) return "Transaction pending...";
  if (isSwappingToUsdu && isQuoteLoading) return "Fetching swap quote...";
  if (isSwappingToUsdu && quoteError) return "Swap unavailable";
  if (!address) return "Connect Wallet";
  if (errors.length > 0) return errors[0];
  if (!amount) return "Enter withdraw amount";
  if (!hasDeposit) return "No deposit in this pool";

  if (hasRewards && claimRewards) {
    return isSwappingToUsdu
      ? "Withdraw, Claim & Swap to USDU"
      : "Withdraw & Claim Rewards";
  }

  if (hasRewards && !claimRewards) return "Withdraw & Compound USDU";

  return "Withdraw USDU";
}

interface WithdrawFlowProps {
  address: string | undefined;
  usduPrice: { price: Big } | undefined;
  selectedPosition: {
    userDeposit: Big;
    totalDeposits: Big;
    rewards?: {
      usdu: Big;
      collateral: Big;
    };
  } | null;
  selectedCollateral: CollateralId;
  selectedCollateralSymbol: string;
  claimRewards: boolean;
  setClaimRewards: (value: boolean) => void;
  connectWallet: () => Promise<void>;
  amount: Big | null;
  setAmount: (value: Big | null) => void;
}

export function WithdrawFlow({
  address,
  usduPrice,
  selectedPosition,
  selectedCollateral,
  selectedCollateralSymbol,
  claimRewards,
  setClaimRewards,
  connectWallet,
  amount,
  setAmount,
}: WithdrawFlowProps) {
  // State for collateral output preference when claiming
  const [collateralOutputToken, setCollateralOutputToken] =
    useState<CollateralOutputToken>("COLLATERAL");

  // Check if there are collateral rewards to potentially swap
  const hasCollateralRewards =
    selectedPosition?.rewards?.collateral &&
    selectedPosition.rewards.collateral.gt(0);

  // Form is used for validation only, amount comes from URL state
  const form = useForm({
    defaultValues: {
      amount: amount ?? undefined,
    },
    onSubmit: async () => {
      if (!amount || amount.lte(0)) return;

      try {
        if (!isReady) {
          return;
        }
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
    reset: transactionReset,
    expectedUsduAmount,
    isQuoteLoading,
    quoteError,
  } = useStabilityPoolTransaction({
    action: "withdraw",
    amount: amount ?? undefined,
    doClaim: claimRewards,
    collateralType: selectedCollateral,
    rewards: selectedPosition?.rewards,
    collateralOutputToken: claimRewards ? collateralOutputToken : "COLLATERAL",
  });

  // Re-validate amount when wallet connects/disconnects (intentionally omitting form)
  useEffect(() => {
    if (address && amount && amount.gt(0)) {
      form.validateField("amount", "change");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const handleComplete = useCallback(() => {
    setAmount(null);
    form.reset();
    transactionReset();
  }, [form, transactionReset, setAmount]);

  return (
    <>
      {["pending", "success", "error"].includes(currentState) ? (
        <TransactionStatus
          transactionHash={transactionHash}
          isError={currentState === "error"}
          isSuccess={currentState === "success"}
          error={transactionError as Error | null}
          successTitle={
            formData.collateralOutputToken === "USDU" &&
            formData.rewardsClaimed?.collateral.gt(0)
              ? "Withdraw & Swap Successful!"
              : "Withdraw Successful!"
          }
          successSubtitle={
            formData.collateralOutputToken === "USDU" &&
            formData.rewardsClaimed?.collateral.gt(0)
              ? `Your USDU has been withdrawn and ${selectedCollateralSymbol} rewards swapped to USDU.`
              : `Your USDU has been withdrawn from the ${selectedCollateralSymbol} Stability Pool.`
          }
          details={
            "withdrawAmount" in formData &&
            formData.withdrawAmount &&
            transactionHash
              ? [
                  {
                    label: "USDU Withdrawn",
                    value: (
                      <>
                        <NumericFormat
                          displayType="text"
                          value={formData.withdrawAmount.toString()}
                          thousandSeparator=","
                          decimalScale={2}
                          fixedDecimalScale
                        />{" "}
                        USDU
                      </>
                    ),
                  },
                  {
                    label: "Pool",
                    value: `${selectedCollateralSymbol} Stability Pool`,
                  },
                  // Add rewards claimed if applicable
                  ...(claimRewards &&
                  formData.rewardsClaimed &&
                  (formData.rewardsClaimed.usdu.gt(0) ||
                    formData.rewardsClaimed.collateral.gt(0))
                    ? [
                        {
                          label: "Rewards Claimed",
                          value: (
                            <div className="space-y-1 text-right">
                              {formData.rewardsClaimed.usdu.gt(0) && (
                                <div>
                                  <NumericFormat
                                    displayType="text"
                                    value={formData.rewardsClaimed.usdu.toString()}
                                    thousandSeparator=","
                                    decimalScale={2}
                                    fixedDecimalScale
                                  />{" "}
                                  USDU
                                </div>
                              )}
                              {formData.rewardsClaimed.collateral.gt(0) && (
                                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                  <span>
                                    <NumericFormat
                                      displayType="text"
                                      value={formData.rewardsClaimed.collateral.toString()}
                                      thousandSeparator=","
                                      decimalScale={6}
                                    />{" "}
                                    {selectedCollateralSymbol}
                                  </span>
                                  {formData.collateralOutputToken === "USDU" &&
                                    formData.expectedUsduAmount && (
                                      <>
                                        <span className="text-neutral-400">→</span>
                                        <span className="text-green-600 font-medium">
                                          <NumericFormat
                                            displayType="text"
                                            value={bigintToBig(
                                              BigInt(formData.expectedUsduAmount),
                                              TOKENS.USDU.decimals
                                            ).toString()}
                                            thousandSeparator=","
                                            decimalScale={2}
                                          />{" "}
                                          USDU
                                        </span>
                                      </>
                                    )}
                                </div>
                              )}
                            </div>
                          ),
                        },
                      ]
                    : []),
                ]
              : undefined
          }
          onComplete={handleComplete}
          completeButtonText="Go back to Stability Pool"
        />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className={isSending || isPending ? "opacity-75" : ""}
        >
          <div className="space-y-1">
            <form.Field
              name="amount"
              asyncDebounceMs={300}
              validators={{
                onChangeAsync: async ({ value }) => {
                  if (!address || !value) return undefined;
                  if (!selectedPosition) return undefined;
                  const userDeposit =
                    selectedPosition?.userDeposit || new Big(0);
                  return validators.compose(
                    validators.insufficientBalance(value, userDeposit)
                  );
                },
              }}
            >
              {(field) => (
                <WithdrawSection
                  value={amount ?? undefined}
                  onChange={(value) => {
                    setAmount(value ?? null);
                    field.handleChange(value);
                  }}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors?.[0]}
                  price={usduPrice}
                  selectedPosition={
                    selectedPosition
                      ? {
                          ...selectedPosition,
                          totalDeposits:
                            selectedPosition.totalDeposits || new Big(0),
                          pendingUsduGain:
                            selectedPosition.rewards?.usdu || new Big(0),
                          pendingCollGain:
                            selectedPosition.rewards?.collateral || new Big(0),
                        }
                      : null
                  }
                  onPercentageClick={(percentage) => {
                    const userDeposit =
                      selectedPosition?.userDeposit || new Big(0);
                    const newValue =
                      percentage === 1
                        ? userDeposit
                        : userDeposit.times(percentage);
                    setAmount(newValue);
                    field.handleChange(newValue);
                  }}
                />
              )}
            </form.Field>

            <div className="space-y-3">
              <ClaimRewardsToggle
                rewards={selectedPosition?.rewards}
                collateralSymbol={selectedCollateralSymbol}
                claimRewards={claimRewards}
                setClaimRewards={setClaimRewards}
                disabled={isSending || isPending}
                actionLabel="withdrawing"
              />

              {claimRewards && hasCollateralRewards && (
                <CollateralSwapSelector
                  collateralOutputToken={collateralOutputToken}
                  setCollateralOutputToken={setCollateralOutputToken}
                  collateralSymbol={selectedCollateralSymbol}
                  collateralId={selectedCollateral}
                  collateralAmount={
                    selectedPosition?.rewards?.collateral ?? new Big(0)
                  }
                  expectedUsduAmount={expectedUsduAmount}
                  isQuoteLoading={isQuoteLoading}
                  quoteError={quoteError}
                  disabled={isSending || isPending}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col items-start space-y-4 mt-4">
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                errors: state.fieldMeta.amount?.errors || [],
              })}
            >
              {({ canSubmit, errors }) => {
                const hasRewards =
                  selectedPosition?.rewards &&
                  (selectedPosition.rewards.usdu.gt(0) ||
                    selectedPosition.rewards.collateral.gt(0));

                const hasDeposit =
                  selectedPosition?.userDeposit &&
                  selectedPosition.userDeposit.gt(0);

                const isSwappingToUsdu =
                  claimRewards &&
                  hasCollateralRewards &&
                  collateralOutputToken === "USDU";

                const isSwapDisabled =
                  isSwappingToUsdu && (isQuoteLoading || !!quoteError);

                const buttonText = getWithdrawButtonText({
                  address,
                  errors,
                  amount,
                  hasDeposit: !!hasDeposit,
                  hasRewards: !!hasRewards,
                  claimRewards,
                  isSwappingToUsdu,
                  isSending,
                  isPending,
                  isQuoteLoading,
                  quoteError: !!quoteError,
                });

                return (
                  <Button
                    type={address ? "submit" : "button"}
                    onClick={!address ? connectWallet : undefined}
                    disabled={
                      !!address &&
                      (!amount ||
                        amount.lte(0) ||
                        !hasDeposit ||
                        isSending ||
                        isPending ||
                        !canSubmit ||
                        isSwapDisabled)
                    }
                    className="w-full h-12 bg-token-bg-blue hover:bg-blue-600 text-white text-sm font-medium font-sora py-4 px-6 rounded-xl transition-all whitespace-nowrap"
                  >
                    {buttonText}
                  </Button>
                );
              }}
            </form.Subscribe>
          </div>
        </form>
      )}
    </>
  );
}
