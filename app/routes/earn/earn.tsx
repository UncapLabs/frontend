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
import { useEffect, useCallback, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useAccount, useBalance } from "@starknet-react/core";
import {
  USDU_TOKEN,
  UBTC_TOKEN,
  GBTC_TOKEN,
  type CollateralType,
} from "~/lib/contracts/constants";
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
  ) as [CollateralType, (value: CollateralType | null) => void];
  const [claimRewards, setClaimRewards] = useQueryState(
    "claim",
    parseAsBoolean.withDefault(true)
  );
  // Use local state for amount to avoid URL precision issues
  const [amountState, setAmountState] = useState<number | undefined>(undefined);

  const form = useForm({
    defaultValues: {
      amount: amountState ?? (undefined as number | undefined),
    },
    onSubmit: async ({ value }) => {
      // For claim action, we don't need an amount
      if (action !== "claim" && !value.amount) return;

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
    token: USDU_TOKEN.address,
    address: address,
    refetchInterval: 30000,
  });

  const amount = form.state.values.amount;

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
    amount: amount,
    doClaim: claimRewards,
    collateralType: selectedCollateral,
    rewards: selectedPosition?.rewards,
  });

  useEffect(() => {
    if (address && amount && amount > 0) {
      form.validateField("amount", "change");
    }
  }, [address, action]);

  const handleComplete = useCallback(() => {
    form.reset();
    setAmountState(undefined);
    transactionReset();
  }, [form, transactionReset]);

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <h1 className="text-3xl font-medium leading-none mb-6 font-sora text-neutral-800">
          Stability Pool
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 lg:max-w-6xl gap-6">
        {/* Table section: top on mobile, right on desktop */}
        <div className="lg:col-span-3 lg:order-2">
          <StabilityPoolsTable />
        </div>

        {/* Form section: bottom on mobile, left on desktop */}
        <div className="lg:col-span-4 lg:order-1">
          <div>
            {/* Tab navigation at the top */}
            <div className="flex gap-6  pb-6">
              <button
                type="button"
                onClick={() => setAction("deposit")}
                className={`pb-2 px-1 text-sm font-medium font-sora transition-colors relative ${
                  action === "deposit"
                    ? "text-neutral-800 border-b-2 border-token-bg-blue -mb-[2px]"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                Deposit
              </button>
              <button
                type="button"
                onClick={() => setAction("withdraw")}
                className={`pb-2 px-1 text-sm font-medium font-sora transition-colors relative ${
                  action === "withdraw"
                    ? "text-neutral-800 border-b-2 border-token-bg-blue -mb-[2px]"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                Withdraw
              </button>
              <button
                type="button"
                onClick={() => setAction("claim")}
                className={`pb-2 px-1 text-sm font-medium font-sora transition-colors relative ${
                  action === "claim"
                    ? "text-neutral-800 border-b-2 border-token-bg-blue -mb-[2px]"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                Claim Rewards
              </button>
            </div>

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
                                  "depositAmount" in formData
                                    ? formData.depositAmount
                                    : action === "withdraw" &&
                                      "withdrawAmount" in formData
                                    ? formData.withdrawAmount
                                    : 0
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
                        (formData.rewardsClaimed.usdu > 0 ||
                          formData.rewardsClaimed.collateral > 0)
                          ? [
                              {
                                label: "Rewards Claimed",
                                value: (
                                  <div className="space-y-1">
                                    {formData.rewardsClaimed.usdu > 0 && (
                                      <div>
                                        <NumericFormat
                                          displayType="text"
                                          value={formData.rewardsClaimed.usdu}
                                          thousandSeparator=","
                                          decimalScale={2}
                                          fixedDecimalScale
                                        />{" "}
                                        USDU
                                      </div>
                                    )}
                                    {formData.rewardsClaimed.collateral > 0 && (
                                      <div>
                                        <NumericFormat
                                          displayType="text"
                                          value={
                                            formData.rewardsClaimed.collateral
                                          }
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
                {/* Collateral Selection */}
                <div className="bg-white rounded-2xl p-4 mb-2">
                  <Label className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight mb-3 block">
                    Select Stability Pool
                  </Label>
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
                        src={UBTC_TOKEN.icon}
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
                        src={GBTC_TOKEN.icon}
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
                    className={`space-y-6 ${
                      isSending || isPending ? "opacity-75" : ""
                    }`}
                  >
                    {action === "claim" ? (
                      <ClaimRewardsSection
                        selectedPosition={selectedPosition}
                        selectedCollateral={selectedCollateral}
                        usduPrice={usduPrice?.price || 1}
                        collateralPrice={bitcoinPrice?.price || 0}
                      />
                    ) : action === "deposit" ? (
                      <form.Field
                        name="amount"
                        asyncDebounceMs={300}
                        validators={{
                          onChangeAsync: async ({ value }) => {
                            if (!address || !value) return undefined;
                            if (!usduBalance) return undefined;
                            const balance =
                              Number(usduBalance.value) /
                              10 ** USDU_TOKEN.decimals;
                            return validators.compose(
                              validators.insufficientBalance(value, balance)
                            );
                          },
                        }}
                      >
                        {(field) => (
                          <DepositSection
                            value={field.state.value}
                            onChange={(value) => {
                              field.handleChange(value);
                              setAmountState(value || undefined);
                            }}
                            onBlur={field.handleBlur}
                            error={field.state.meta.errors?.[0]}
                            balance={usduBalance}
                            price={usduPrice}
                            selectedCollateral={selectedCollateral}
                            claimRewards={claimRewards}
                            selectedPosition={
                              selectedPosition
                                ? {
                                    ...selectedPosition,
                                    totalDeposits:
                                      allPositions[selectedCollateral]
                                        ?.totalDeposits || 0,
                                    pendingUsduGain:
                                      selectedPosition.rewards?.usdu || 0,
                                    pendingCollGain:
                                      selectedPosition.rewards?.collateral || 0,
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
                              selectedPosition.userDeposit || 0;
                            return validators.compose(
                              validators.insufficientBalance(value, userDeposit)
                            );
                          },
                        }}
                      >
                        {(field) => (
                          <WithdrawSection
                            value={field.state.value}
                            onChange={(value) => {
                              field.handleChange(value);
                              setAmountState(value || undefined);
                            }}
                            onBlur={field.handleBlur}
                            error={field.state.meta.errors?.[0]}
                            price={usduPrice}
                            selectedCollateral={selectedCollateral}
                            selectedPosition={
                              selectedPosition
                                ? {
                                    ...selectedPosition,
                                    totalDeposits:
                                      allPositions[selectedCollateral]
                                        ?.totalDeposits || 0,
                                    pendingUsduGain:
                                      selectedPosition.rewards?.usdu || 0,
                                    pendingCollGain:
                                      selectedPosition.rewards?.collateral || 0,
                                  }
                                : null
                            }
                            claimRewards={claimRewards}
                            onPercentageClick={(percentage) => {
                              const userDeposit =
                                selectedPosition?.userDeposit || 0;
                              // For MAX (percentage === 1), use exact value to avoid floating-point precision issues
                              const newValue =
                                percentage === 1
                                  ? userDeposit
                                  : userDeposit * percentage;
                              field.handleChange(newValue);
                              setAmountState(newValue || undefined);
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
                                  selectedPosition.rewards.usdu === 0
                                }
                              />
                              <Label
                                htmlFor="compound-rewards"
                                className={`text-sm font-medium select-none flex items-center gap-2 ${
                                  !selectedPosition?.rewards?.usdu ||
                                  selectedPosition.rewards.usdu === 0
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
                                        automatically re-deposited for compound
                                        growth
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
                              selectedPosition.rewards.usdu === 0
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
                                value={selectedPosition?.rewards?.usdu || 0}
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
                          (selectedPosition.rewards.usdu > 0 ||
                            selectedPosition.rewards.collateral > 0) && (
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
                                    Claim USDU rewards
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
                                            If checked, rewards will be sent to
                                            your wallet
                                          </p>
                                          <p className="font-medium mt-2"></p>
                                          <p className="text-xs">
                                            If left unchecked, USDU rewards will
                                            be automatically re-deposited
                                            (compounded) for higher yields
                                          </p>
                                          {action === "withdraw" && (
                                            <p className="text-xs text-amber-300 mt-2">
                                              ⚠️ Must be checked to fully exit
                                              the pool
                                            </p>
                                          )}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </Label>
                                </div>
                                <p className="text-xs text-neutral-500 mt-1 ml-7">
                                  {claimRewards
                                    ? "Rewards will be sent to your wallet"
                                    : "USDU rewards will be re-deposited to the pool"}
                                </p>
                              </div>

                              <div className="text-right space-y-1">
                                {selectedPosition.rewards.usdu > 0 && (
                                  <div className="text-sm font-medium text-neutral-700">
                                    <NumericFormat
                                      displayType="text"
                                      value={selectedPosition.rewards.usdu}
                                      thousandSeparator=","
                                      decimalScale={2}
                                      fixedDecimalScale
                                    />{" "}
                                    USDU
                                  </div>
                                )}
                                {selectedPosition.rewards.collateral > 0 && (
                                  <div className="text-sm font-medium text-neutral-700">
                                    <NumericFormat
                                      displayType="text"
                                      value={
                                        selectedPosition.rewards.collateral
                                      }
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
                          (selectedPosition.rewards.usdu === 0 &&
                            selectedPosition.rewards.collateral === 0)) && (
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
                                        when you have deposits in the stability
                                        pool.
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

                    <div className="flex flex-col items-start space-y-4 mt-6">
                      <form.Subscribe
                        selector={(state) => ({
                          canSubmit: state.canSubmit,
                          errors: state.fieldMeta.amount?.errors || [],
                          amount: state.values.amount,
                        })}
                      >
                        {({ canSubmit, errors, amount }) => {
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
                          } else if (action !== "claim" && !amount) {
                            buttonText =
                              action === "deposit"
                                ? "Enter deposit amount"
                                : "Enter withdraw amount";
                          } else if (
                            action === "withdraw" &&
                            (selectedPosition?.userDeposit ?? 0) === 0
                          ) {
                            buttonText = "No deposit in this pool";
                          } else if (
                            action === "claim" &&
                            (!selectedPosition?.rewards ||
                              (selectedPosition.rewards.usdu === 0 &&
                                selectedPosition.rewards.collateral === 0))
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
                                  (!amount ||
                                    amount <= 0 ||
                                    (action === "withdraw" &&
                                      (selectedPosition?.userDeposit ?? 0) ===
                                        0))) ||
                                  (action === "claim" &&
                                    (!selectedPosition?.rewards ||
                                      (selectedPosition.rewards.usdu === 0 &&
                                        selectedPosition.rewards.collateral ===
                                          0))) ||
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
                  </div>
                </form>
              </>
            )}
          </div>
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
