import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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

  const { usdu: usduPrice } = useFetchPrices({
    fetchBitcoin: false,
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
    <div className="mx-auto max-w-6xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <h1 className="text-3xl font-bold mb-2 text-slate-800">
          Stability Pool
        </h1>
      </div>
      <Separator className="mb-8 bg-slate-200" />

      <div className="space-y-6">
        <StabilityPoolsTable selectedCollateral={selectedCollateral} />

        {/* Collateral Selection */}
        <div className="flex items-center gap-4">
          <Label htmlFor="collateral-select" className="text-sm font-medium">
            Select Pool:
          </Label>
          <Select
            value={selectedCollateral}
            onValueChange={(value) =>
              setSelectedCollateral(value as CollateralType)
            }
            disabled={isSending || isPending}
          >
            <SelectTrigger id="collateral-select" className="w-[180px]">
              <SelectValue placeholder="Select a collateral" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UBTC">
                <div className="flex items-center gap-2">
                  <img src={UBTC_TOKEN.icon} alt="UBTC" className="w-4 h-4" />
                  <span>UBTC Pool</span>
                </div>
              </SelectItem>
              <SelectItem value="GBTC">
                <div className="flex items-center gap-2">
                  <img src={GBTC_TOKEN.icon} alt="GBTC" className="w-4 h-4" />
                  <span>GBTC Pool</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
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
                                      value={formData.rewardsClaimed.collateral}
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
                <CardContent className="pt-6 space-y-6 flex flex-col">
                  <div className="flex gap-6 border-b border-slate-200 pb-2">
                    <button
                      type="button"
                      onClick={() => setAction("deposit")}
                      className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                        action === "deposit"
                          ? "text-slate-900 border-b-2 border-blue-500 -mb-[2px]"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Deposit
                    </button>
                    <button
                      type="button"
                      onClick={() => setAction("withdraw")}
                      className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                        action === "withdraw"
                          ? "text-slate-900 border-b-2 border-blue-500 -mb-[2px]"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Withdraw
                    </button>
                    <button
                      type="button"
                      onClick={() => setAction("claim")}
                      className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                        action === "claim"
                          ? "text-slate-900 border-b-2 border-blue-500 -mb-[2px]"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Claim Rewards
                    </button>
                  </div>

                  <div className="flex-1">
                    {action === "claim" ? (
                      <ClaimRewardsSection
                        selectedPosition={selectedPosition}
                        selectedCollateral={selectedCollateral}
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
                  </div>

                  {action === "claim" ? (
                    // Simplified checkbox for Claim - matching deposit/withdraw style
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
                              disabled={isSending || isPending}
                            />
                            <Label
                              htmlFor="compound-rewards"
                              className="text-sm font-medium cursor-pointer select-none flex items-center gap-2"
                            >
                              Auto-compound USDU rewards
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="max-w-xs bg-slate-900 text-white"
                                >
                                  <div className="space-y-2">
                                    <p className="font-medium">✓ Checked:</p>
                                    <p className="text-xs">
                                      USDU rewards will be automatically
                                      re-deposited for compound growth
                                    </p>
                                    <p className="font-medium mt-2">
                                      ☐ Unchecked:
                                    </p>
                                    <p className="text-xs">
                                      All rewards will be sent to your wallet
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </Label>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 ml-7">
                            {!claimRewards
                              ? "USDU rewards will be re-deposited to the pool"
                              : "All rewards will be sent to your wallet"}
                          </p>
                        </div>

                        <div className="text-right space-y-1">
                          <div className="text-sm font-medium text-slate-700">
                            <NumericFormat
                              displayType="text"
                              value={selectedPosition?.rewards?.usdu || 0}
                              thousandSeparator=","
                              decimalScale={2}
                              fixedDecimalScale
                            />{" "}
                            USDU
                          </div>
                          <div className="text-sm font-medium text-slate-700">
                            <NumericFormat
                              displayType="text"
                              value={selectedPosition?.rewards?.collateral || 0}
                              thousandSeparator=","
                              decimalScale={6}
                              fixedDecimalScale
                            />{" "}
                            {selectedCollateral}
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
                                  className="text-sm font-medium cursor-pointer select-none flex items-center gap-2"
                                >
                                  Claim rewards
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="max-w-xs bg-slate-900 text-white"
                                    >
                                      <div className="space-y-2">
                                        <p className="font-medium">
                                          ✓ Checked:
                                        </p>
                                        <p className="text-xs">
                                          Rewards will be sent to your wallet
                                        </p>
                                        <p className="font-medium mt-2">
                                          ☐ Unchecked:
                                        </p>
                                        <p className="text-xs">
                                          USDU rewards will be automatically
                                          re-deposited (compounded) for higher
                                          yields
                                        </p>
                                        {action === "withdraw" && (
                                          <p className="text-xs text-amber-300 mt-2">
                                            ⚠️ Must be checked to fully exit the
                                            pool
                                          </p>
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </Label>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 ml-7">
                                {claimRewards
                                  ? "Rewards will be sent to your wallet"
                                  : "USDU rewards will be re-deposited to the pool"}
                              </p>
                            </div>

                            <div className="text-right space-y-1">
                              {selectedPosition.rewards.usdu > 0 && (
                                <div className="text-sm font-medium text-slate-700">
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
                                <div className="text-sm font-medium text-slate-700">
                                  <NumericFormat
                                    displayType="text"
                                    value={selectedPosition.rewards.collateral}
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
                        <div className="text-sm text-slate-500 text-center">
                          No rewards available to claim
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
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-6 rounded-xl shadow-sm hover:shadow transition-all whitespace-nowrap"
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
                </CardContent>
              </Card>
            </form>
          </>
        )}
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
