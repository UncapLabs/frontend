import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { useCallback, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { type CollateralId } from "~/lib/collateral";
import { NumericFormat } from "react-number-format";
import { useStabilityPoolTransaction } from "~/hooks/use-stability-pool-transaction";
import { validators } from "~/lib/validators";
import { WithdrawSection } from "~/components/earn/withdraw-section";
import { HelpCircle } from "lucide-react";
import Big from "big.js";

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
}: WithdrawFlowProps) {
  const form = useForm({
    defaultValues: {
      amount: undefined as Big | undefined,
    },
    onSubmit: async ({ value }) => {
      if (!value.amount || value.amount.lte(0)) return;

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
  } = useStabilityPoolTransaction({
    action: "withdraw",
    amount: form.state.values.amount,
    doClaim: claimRewards,
    collateralType: selectedCollateral,
    rewards: selectedPosition?.rewards,
  });

  useEffect(() => {
    if (address && form.state.values.amount && form.state.values.amount.gt(0)) {
      form.validateField("amount", "change");
    }
  }, [address]);

  const handleComplete = useCallback(() => {
    form.reset();
    transactionReset();
  }, [form, transactionReset]);

  return (
    <>
      {["pending", "success", "error"].includes(currentState) ? (
        <TransactionStatus
          transactionHash={transactionHash}
          isError={currentState === "error"}
          isSuccess={currentState === "success"}
          error={transactionError as Error | null}
          successTitle="Withdraw Successful!"
          successSubtitle={`Your USDU has been withdrawn from the ${selectedCollateralSymbol} Stability Pool.`}
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
                            <div className="space-y-1">
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
                                <div>
                                  <NumericFormat
                                    displayType="text"
                                    value={formData.rewardsClaimed.collateral.toString()}
                                    thousandSeparator=","
                                    decimalScale={6}
                                    fixedDecimalScale
                                  />{" "}
                                  {selectedCollateralSymbol}
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
                  const userDeposit = selectedPosition?.userDeposit || new Big(0);
                  return validators.compose(
                    validators.insufficientBalance(value, userDeposit)
                  );
                },
              }}
            >
              {(field) => (
                <WithdrawSection
                  value={field.state.value}
                  onChange={field.handleChange}
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
                    const userDeposit = selectedPosition?.userDeposit || new Big(0);
                    const newValue =
                      percentage === 1 ? userDeposit : userDeposit.times(percentage);
                    field.handleChange(newValue);
                  }}
                />
              )}
            </form.Field>

            {/* Claim rewards checkbox */}
            <div className="space-y-3">
              {selectedPosition?.rewards &&
                (selectedPosition.rewards.usdu.gt(0) ||
                  selectedPosition.rewards.collateral.gt(0)) && (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="claim-rewards-withdraw"
                          checked={claimRewards}
                          onCheckedChange={(checked) =>
                            setClaimRewards(checked === true)
                          }
                          disabled={isSending || isPending}
                        />
                        <Label
                          htmlFor="claim-rewards-withdraw"
                          className="text-sm font-medium cursor-pointer select-none flex items-center gap-2 text-neutral-700"
                        >
                          Claim rewards while withdrawing
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3.5 w-3.5 text-neutral-400 hover:text-neutral-600" />
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-xs bg-slate-900 text-white"
                            >
                              <div className="space-y-2">
                                <p className="text-xs">
                                  If checked, both USDU and{" "}
                                  {selectedCollateralSymbol} rewards will be
                                  claimed and sent to your wallet
                                </p>
                                <p className="text-xs">
                                  If left unchecked, USDU rewards will be
                                  compounded and {selectedCollateralSymbol}{" "}
                                  rewards will stay in pool and can be claimed
                                  later
                                </p>
                                <p className="text-xs text-amber-300 mt-2">
                                  ⚠️ To fully exit, check this box to claim all
                                  rewards
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1 ml-7">
                        {claimRewards
                          ? `USDU and ${selectedCollateralSymbol} rewards will be sent to your wallet`
                          : `USDU rewards will be compounded; ${selectedCollateralSymbol} rewards stay in pool and can be claimed later`}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      {selectedPosition.rewards.usdu.gt(0) && (
                        <div className="text-sm font-medium text-neutral-700">
                          <NumericFormat
                            displayType="text"
                            value={selectedPosition.rewards.usdu.toString()}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />{" "}
                          USDU
                        </div>
                      )}
                      {selectedPosition.rewards.collateral.gt(0) && (
                        <div className="text-sm font-medium text-neutral-700">
                          <NumericFormat
                            displayType="text"
                            value={selectedPosition.rewards.collateral.toString()}
                            thousandSeparator=","
                            decimalScale={6}
                            fixedDecimalScale
                          />{" "}
                          {selectedCollateralSymbol}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Show message when no rewards available */}
              {(!selectedPosition?.rewards ||
                (selectedPosition.rewards.usdu.eq(0) &&
                  selectedPosition.rewards.collateral.eq(0))) && (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="claim-rewards-withdraw"
                        checked={false}
                        disabled={true}
                      />
                      <Label
                        htmlFor="claim-rewards-withdraw"
                        className="text-sm font-medium select-none flex items-center gap-2 text-neutral-400"
                      >
                        Claim rewards
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3.5 w-3.5 text-neutral-300" />
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-xs bg-slate-900 text-white"
                          >
                            <p className="text-xs">
                              No rewards available. Rewards accrue when you have
                              deposits in the stability pool.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 ml-7">
                      No rewards available to claim
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-sm font-medium text-neutral-400">
                      0.00 USDU
                    </div>
                    <div className="text-sm font-medium text-neutral-400">
                      0.000000 {selectedCollateralSymbol}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start space-y-4 mt-6">
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                errors: state.fieldMeta.amount?.errors || [],
                amount: state.values.amount,
              })}
            >
              {({ canSubmit, errors }) => {
                const hasRewards =
                  selectedPosition?.rewards &&
                  (selectedPosition.rewards.usdu.gt(0) ||
                    selectedPosition.rewards.collateral.gt(0));

                let buttonText = "";

                if (!address) {
                  buttonText = "Connect Wallet";
                } else if (errors.length > 0) {
                  buttonText = errors[0];
                } else if (!form.state.values.amount) {
                  buttonText = "Enter withdraw amount";
                } else if (
                  !selectedPosition?.userDeposit ||
                  selectedPosition.userDeposit.eq(0)
                ) {
                  buttonText = "No deposit in this pool";
                } else if (hasRewards && claimRewards) {
                  buttonText = "Withdraw & Claim Rewards";
                } else if (hasRewards && !claimRewards) {
                  buttonText = "Withdraw & Compound USDU";
                } else {
                  buttonText = "Withdraw USDU";
                }

                return (
                  <Button
                    type={address ? "submit" : "button"}
                    onClick={!address ? connectWallet : undefined}
                    disabled={
                      !!address &&
                      (!form.state.values.amount ||
                        form.state.values.amount.lte(0) ||
                        (!selectedPosition?.userDeposit ||
                          selectedPosition.userDeposit.eq(0)) ||
                        isSending ||
                        isPending ||
                        !canSubmit)
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
        </form>
      )}
    </>
  );
}
