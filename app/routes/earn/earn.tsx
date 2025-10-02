import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { ArrowIcon } from "~/components/icons/arrow-icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { useEffect, useCallback } from "react";
import { useForm } from "@tanstack/react-form";
import { useAccount, useBalance } from "@starknet-react/core";
import { TOKENS, COLLATERALS, type CollateralId } from "~/lib/collateral";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { useAllStabilityPoolPositions } from "~/hooks/use-stability-pool";
import { useStabilityPoolTransaction } from "~/hooks/use-stability-pool-transaction";
import { useWalletConnect } from "~/hooks/use-wallet-connect";
import { validators } from "~/lib/validators";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import { StabilityPoolsTable } from "~/components/earn/stability-pools-table";
import { useQueryState, parseAsString, parseAsBoolean } from "nuqs";
import { HelpCircle } from "lucide-react";
import { DepositSection } from "~/components/earn/deposit-section";
import { WithdrawSection } from "~/components/earn/withdraw-section";
import { ClaimRewardsSection } from "~/components/earn/claim-rewards-section";
import Big from "big.js";
import { bigintToBig } from "~/lib/decimal";

type ActionType = "deposit" | "withdraw" | "claim";

function Earn() {
  const { address } = useAccount();
  const { connectWallet } = useWalletConnect();

  const [action, setAction] = useQueryState(
    "action",
    parseAsString.withDefault("deposit")
  ) as [ActionType, (value: ActionType | null) => void];
  const [selectedCollateral, setSelectedCollateral] = useQueryState(
    "collateral",
    parseAsString.withDefault("UBTC")
  ) as [CollateralId, (value: CollateralId | null) => void];
  const [claimRewards, setClaimRewards] = useQueryState(
    "claim",
    parseAsBoolean.withDefault(true)
  );

  const form = useForm({
    defaultValues: {
      amount: new Big(0) as Big | undefined,
    },
    onSubmit: async ({ value }) => {
      // For claim action, we don't need an amount
      if (action !== "claim" && (!value.amount || value.amount.lte(0))) return;

      try {
        if (!isReady) {
          if (!address) {
            toast.error("Please connect your wallet");
          }
          return;
        }
        await send();
      } catch (error) {
        console.error("Transaction error:", error);
      }
    },
  });

  const { data: usduBalance } = useBalance({
    token: TOKENS.USDU.address,
    address: address,
    refetchInterval: 30000,
  });

  const allPositions = useAllStabilityPoolPositions();
  const selectedPosition = allPositions[selectedCollateral];

  const { usdu: usduPrice, bitcoin: bitcoinPrice } = useFetchPrices({
    collateralType: selectedCollateral,
    fetchBitcoin: true,
    fetchUsdu: true,
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
    action: action,
    amount: form.state.values.amount,
    doClaim: claimRewards,
    collateralType: selectedCollateral,
    rewards: selectedPosition?.rewards,
  });

  useEffect(() => {
    if (address && form.state.values.amount && form.state.values.amount.gt(0)) {
      form.validateField("amount", "change");
    }
  }, [address, action]);

  const handleComplete = useCallback(() => {
    form.reset();
    transactionReset();
  }, [form, transactionReset]);

  return (
    <div className="w-full mx-auto max-w-7xl py-8 lg:py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between pb-6 items-baseline">
        <h1 className="text-2xl md:text-3xl font-medium leading-none font-sora text-neutral-800">
          Stability Pool
        </h1>
      </div>

      <div className="flex flex-col-reverse lg:flex-row gap-5">
        {/* Left Section: Form */}
        <div className="flex-1 lg:flex-[2]">
          <div>
            {["pending", "success", "error"].includes(currentState) ? (
              <TransactionStatus
                transactionHash={transactionHash}
                isError={currentState === "error"}
                isSuccess={currentState === "success"}
                error={transactionError as Error | null}
                successTitle={
                  action === "deposit"
                    ? "Deposit Successful!"
                    : "Withdraw Successful!"
                }
                successSubtitle={
                  action === "deposit"
                    ? `Your USDU has been deposited into the ${selectedCollateral} Stability Pool.`
                    : `Your USDU has been withdrawn from the ${selectedCollateral} Stability Pool.`
                }
                details={
                  ((action === "deposit" &&
                    "depositAmount" in formData &&
                    formData.depositAmount) ||
                    (action === "withdraw" &&
                      "withdrawAmount" in formData &&
                      formData.withdrawAmount)) &&
                  transactionHash
                    ? [
                        {
                          label:
                            action === "deposit"
                              ? "USDU Deposited"
                              : "USDU Withdrawn",
                          value: (
                            <>
                              <NumericFormat
                                displayType="text"
                                value={
                                  action === "deposit" &&
                                  "depositAmount" in formData &&
                                  formData.depositAmount
                                    ? formData.depositAmount.toString()
                                    : action === "withdraw" &&
                                      "withdrawAmount" in formData &&
                                      formData.withdrawAmount
                                    ? formData.withdrawAmount.toString()
                                    : "0"
                                }
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
                          value: `${selectedCollateral} Stability Pool`,
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
                                    {formData.rewardsClaimed.collateral.gt(
                                      0
                                    ) && (
                                      <div>
                                        <NumericFormat
                                          displayType="text"
                                          value={formData.rewardsClaimed.collateral.toString()}
                                          thousandSeparator=","
                                          decimalScale={6}
                                          fixedDecimalScale
                                        />{" "}
                                        {selectedCollateral}
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
                completeButtonText={
                  action === "deposit"
                    ? "Make Another Deposit"
                    : "Make Another Withdrawal"
                }
              />
            ) : (
              <>
                {/* Combined Action Tabs and Pool Selection */}
                <div className="bg-white rounded-2xl mb-2">
                  <div className="p-4 pb-2">
                    <Label className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight mb-3 block">
                      Choose Action & Pool
                    </Label>
                  </div>

                  {/* Action Tabs Row */}
                  <div className="px-4 pb-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setAction("deposit")}
                        disabled={isSending || isPending}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium font-sora transition-all ${
                          action === "deposit"
                            ? "bg-token-bg-blue text-white"
                            : "text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50"
                        }`}
                      >
                        Deposit
                      </button>
                      <button
                        type="button"
                        onClick={() => setAction("withdraw")}
                        disabled={isSending || isPending}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium font-sora transition-all ${
                          action === "withdraw"
                            ? "bg-token-bg-blue text-white"
                            : "text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50"
                        }`}
                      >
                        Withdraw
                      </button>
                      <button
                        type="button"
                        onClick={() => setAction("claim")}
                        disabled={isSending || isPending}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium font-sora transition-all ${
                          action === "claim"
                            ? "bg-token-bg-blue text-white"
                            : "text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50"
                        }`}
                      >
                        Claim Rewards
                      </button>
                    </div>
                  </div>

                  {/* Pool Selection Row */}
                  <div className="border-t border-neutral-100 p-4 pt-3">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedCollateral("UBTC")}
                        disabled={isSending || isPending}
                        className={`flex-1 p-3 rounded-lg transition-all flex items-center gap-3 ${
                          selectedCollateral === "UBTC"
                            ? "bg-token-bg border-2 border-token-orange"
                            : "bg-neutral-50 border-2 border-transparent hover:bg-neutral-100"
                        }`}
                      >
                        <img
                          src={COLLATERALS.UBTC.icon}
                          alt="UBTC"
                          className="w-8 h-8 object-contain"
                        />
                        <div className="text-left">
                          <span
                            className={`text-sm font-medium font-sora block ${
                              selectedCollateral === "UBTC"
                                ? "text-token-orange"
                                : "text-neutral-800"
                            }`}
                          >
                            UBTC Pool
                          </span>
                          <span className="text-xs text-neutral-500 font-sora">
                            Bitcoin collateral
                          </span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCollateral("GBTC")}
                        disabled={isSending || isPending}
                        className={`flex-1 p-3 rounded-lg transition-all flex items-center gap-3 ${
                          selectedCollateral === "GBTC"
                            ? "bg-token-bg border-2 border-token-orange"
                            : "bg-neutral-50 border-2 border-transparent hover:bg-neutral-100"
                        }`}
                      >
                        <img
                          src={COLLATERALS.GBTC.icon}
                          alt="GBTC"
                          className="w-8 h-8 object-contain"
                        />
                        <div className="text-left">
                          <span
                            className={`text-sm font-medium font-sora block ${
                              selectedCollateral === "GBTC"
                                ? "text-token-orange"
                                : "text-neutral-800"
                            }`}
                          >
                            GBTC Pool
                          </span>
                          <span className="text-xs text-neutral-500 font-sora">
                            Grayscale Bitcoin
                          </span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCollateral("WMWBTC")}
                        disabled={isSending || isPending}
                        className={`flex-1 p-3 rounded-lg transition-all flex items-center gap-3 ${
                          selectedCollateral === "WMWBTC"
                            ? "bg-token-bg border-2 border-token-orange"
                            : "bg-neutral-50 border-2 border-transparent hover:bg-neutral-100"
                        }`}
                      >
                        <img
                          src={COLLATERALS.WMWBTC.icon}
                          alt="wBTC"
                          className="w-8 h-8 object-contain"
                        />
                        <div className="text-left">
                          <span
                            className={`text-sm font-medium font-sora block ${
                              selectedCollateral === "WMWBTC"
                                ? "text-token-orange"
                                : "text-neutral-800"
                            }`}
                          >
                            wBTC Pool
                          </span>
                          <span className="text-xs text-neutral-500 font-sora">
                            Wrapped Bitcoin
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

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

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                >
                  <div
                    className={`bg-white rounded-2xl p-6 ${
                      isSending || isPending ? "opacity-75" : ""
                    }`}
                  >
                    <div className="space-y-6">
                      {action === "claim" ? (
                        <ClaimRewardsSection
                          selectedPosition={selectedPosition}
                          selectedCollateral={selectedCollateral}
                          usduPrice={usduPrice?.price || new Big(1)}
                          collateralPrice={bitcoinPrice?.price || new Big(0)}
                        />
                      ) : action === "deposit" ? (
                        <form.Field
                          name="amount"
                          asyncDebounceMs={300}
                          validators={{
                            onChangeAsync: async ({ value }) => {
                              if (!address || !value) return undefined;
                              if (!usduBalance) return undefined;
                              const balance = bigintToBig(
                                usduBalance.value,
                                TOKENS.USDU.decimals
                              );
                              return validators.compose(
                                validators.insufficientBalance(value, balance)
                              );
                            },
                          }}
                        >
                          {(field) => (
                            <DepositSection
                              value={field.state.value}
                              onChange={field.handleChange}
                              onBlur={field.handleBlur}
                              error={field.state.meta.errors?.[0]}
                              balance={usduBalance}
                              price={usduPrice}
                              selectedPosition={
                                selectedPosition
                                  ? {
                                      ...selectedPosition,
                                      totalDeposits:
                                        selectedPosition.totalDeposits ||
                                        new Big(0),
                                      pendingUsduGain:
                                        selectedPosition.rewards?.usdu ||
                                        new Big(0),
                                      pendingCollGain:
                                        selectedPosition.rewards?.collateral ||
                                        new Big(0),
                                    }
                                  : null
                              }
                            />
                          )}
                        </form.Field>
                      ) : (
                        <form.Field
                          name="amount"
                          asyncDebounceMs={300}
                          validators={{
                            onChangeAsync: async ({ value }) => {
                              if (!address || !value) return undefined;
                              // Don't validate if position data hasn't loaded yet
                              if (!selectedPosition) return undefined;
                              const userDeposit =
                                selectedPosition?.userDeposit || new Big(0);
                              return validators.compose(
                                validators.insufficientBalance(
                                  value,
                                  userDeposit
                                )
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
                                        selectedPosition.totalDeposits ||
                                        new Big(0),
                                      pendingUsduGain:
                                        selectedPosition.rewards?.usdu ||
                                        new Big(0),
                                      pendingCollGain:
                                        selectedPosition.rewards?.collateral ||
                                        new Big(0),
                                    }
                                  : null
                              }
                              onPercentageClick={(percentage) => {
                                const userDeposit =
                                  selectedPosition?.userDeposit || new Big(0);
                                // For MAX (percentage === 1), use exact value to avoid floating-point precision issues
                                const newValue =
                                  percentage === 1
                                    ? userDeposit
                                    : userDeposit.times(percentage);
                                field.handleChange(newValue);
                              }}
                            />
                          )}
                        </form.Field>
                      )}

                      {action === "claim" ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  id="compound-rewards"
                                  checked={!claimRewards} // Note: inverted because claimRewards=false means compound
                                  onCheckedChange={(checked) =>
                                    setClaimRewards(!checked)
                                  }
                                  disabled={
                                    isSending ||
                                    isPending ||
                                    !selectedPosition?.rewards?.usdu ||
                                    selectedPosition.rewards.usdu.eq(0)
                                  }
                                />
                                <Label
                                  htmlFor="compound-rewards"
                                  className={`text-sm font-medium select-none flex items-center gap-2 ${
                                    !selectedPosition?.rewards?.usdu ||
                                    selectedPosition.rewards.usdu.eq(0)
                                      ? "text-neutral-400"
                                      : "text-neutral-700 cursor-pointer"
                                  }`}
                                >
                                  Auto-compound USDU rewards
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
                                          If checked, USDU rewards will be
                                          automatically re-deposited for
                                          compound growth
                                        </p>
                                        <p className="text-xs">
                                          If left unchecked, all rewards will be
                                          sent to your wallet
                                        </p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </Label>
                              </div>
                              <p className="text-xs text-neutral-500 mt-1 ml-7">
                                {!selectedPosition?.rewards?.usdu ||
                                selectedPosition.rewards.usdu.eq(0)
                                  ? "No USDU rewards available to compound"
                                  : !claimRewards
                                  ? "USDU rewards will be re-deposited to the pool"
                                  : "All rewards will be sent to your wallet"}
                              </p>
                            </div>

                            <div className="text-right space-y-1">
                              <div className="text-sm font-medium text-neutral-700">
                                <NumericFormat
                                  displayType="text"
                                  value={
                                    selectedPosition?.rewards?.usdu?.toString() ||
                                    "0"
                                  }
                                  thousandSeparator=","
                                  decimalScale={2}
                                  fixedDecimalScale
                                />{" "}
                                USDU
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedPosition?.rewards &&
                            (selectedPosition.rewards.usdu.gt(0) ||
                              selectedPosition.rewards.collateral.gt(0)) && (
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <Checkbox
                                      id="claim-rewards"
                                      checked={claimRewards}
                                      onCheckedChange={(checked) =>
                                        setClaimRewards(!!checked)
                                      }
                                      disabled={isSending || isPending}
                                    />
                                    <Label
                                      htmlFor="claim-rewards"
                                      className="text-sm font-medium cursor-pointer select-none flex items-center gap-2 text-neutral-700"
                                    >
                                      Claim all rewards
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
                                              If checked, both USDU and {selectedCollateral} rewards
                                              will be claimed and sent to your wallet
                                            </p>
                                            <p className="font-medium mt-2"></p>
                                            <p className="text-xs">
                                              If left unchecked, USDU rewards
                                              will be automatically re-deposited
                                              (compounded) and collateral rewards will
                                              remain unclaimed in the pool
                                            </p>
                                            {action === "withdraw" && (
                                              <p className="text-xs text-amber-300 mt-2">
                                                ⚠️ Must be checked to claim all rewards
                                                when exiting the pool
                                              </p>
                                            )}
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </Label>
                                  </div>
                                  <p className="text-xs text-neutral-500 mt-1 ml-7">
                                    {claimRewards
                                      ? "Both USDU and collateral rewards will be sent to your wallet"
                                      : "USDU will be re-deposited; collateral rewards will remain unclaimed"}
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
                                  {selectedPosition.rewards.collateral.gt(
                                    0
                                  ) && (
                                    <div className="text-sm font-medium text-neutral-700">
                                      <NumericFormat
                                        displayType="text"
                                        value={selectedPosition.rewards.collateral.toString()}
                                        thousandSeparator=","
                                        decimalScale={6}
                                        fixedDecimalScale
                                      />{" "}
                                      {selectedCollateral}
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
                                    id="claim-rewards"
                                    checked={false}
                                    disabled={true}
                                  />
                                  <Label
                                    htmlFor="claim-rewards"
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
                                          No rewards available. Rewards accrue
                                          when you have deposits in the
                                          stability pool.
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
                                  0.000000 {selectedCollateral}
                                </div>
                              </div>
                            </div>
                          )}
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
                        let buttonText =
                          action === "deposit"
                            ? "Deposit USDU"
                            : action === "withdraw"
                            ? "Withdraw USDU"
                            : !claimRewards
                            ? "Claim & Compound Rewards"
                            : "Claim All Rewards";

                        if (!address) {
                          buttonText = "Connect Wallet";
                        } else if (action !== "claim" && errors.length > 0) {
                          buttonText = errors[0];
                        } else if (
                          action !== "claim" &&
                          !form.state.values.amount
                        ) {
                          buttonText =
                            action === "deposit"
                              ? "Enter deposit amount"
                              : "Enter withdraw amount";
                        } else if (
                          action === "withdraw" &&
                          (!selectedPosition?.userDeposit ||
                            selectedPosition.userDeposit.eq(0))
                        ) {
                          buttonText = "No deposit in this pool";
                        } else if (
                          action === "claim" &&
                          (!selectedPosition?.rewards ||
                            (selectedPosition.rewards.usdu.eq(0) &&
                              selectedPosition.rewards.collateral.eq(0)))
                        ) {
                          buttonText = "No rewards to claim";
                        }

                        return (
                          <Button
                            type={address ? "submit" : "button"}
                            onClick={!address ? connectWallet : undefined}
                            disabled={
                              address &&
                              ((action !== "claim" &&
                                (!form.state.values.amount ||
                                  form.state.values.amount.lte(0) ||
                                  (action === "withdraw" &&
                                    (!selectedPosition?.userDeposit ||
                                      selectedPosition.userDeposit.eq(0))))) ||
                                (action === "claim" &&
                                  (!selectedPosition?.rewards ||
                                    (selectedPosition.rewards.usdu.eq(0) &&
                                      selectedPosition.rewards.collateral.eq(
                                        0
                                      )))) ||
                                isSending ||
                                isPending ||
                                (action !== "claim" && !canSubmit))
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
              </>
            )}
          </div>
        </div>

        {/* Right Section: Table */}
        <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:min-w-[320px]">
          <StabilityPoolsTable />
        </div>
      </div>
    </div>
  );
}

export default Earn;

export function meta() {
  return [
    { title: "Stability Pool" },
    {
      name: "description",
      content: "Manage your USDU deposits in Stability Pools",
    },
  ];
}
