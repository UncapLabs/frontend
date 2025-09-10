import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { TokenInput } from "~/components/token-input";
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
import * as dn from "dnum";
import {
  useQueryState,
  parseAsString,
  parseAsBoolean,
} from "nuqs";
import {
  Gift,
  ArrowDownToLine,
  ArrowUpFromLine,
  Plus,
  Minus,
  RefreshCw,
  DollarSign,
  Coins,
} from "lucide-react";
import { DepositSection } from "~/components/earn/deposit-section";
import { WithdrawSection } from "~/components/earn/withdraw-section";
import { ClaimRewardsSection } from "~/components/earn/claim-rewards-section";

type ActionType = "deposit" | "withdraw" | "claim";

function StabilityPool() {
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
  const { usdu } = useFetchPrices({ fetchBitcoin: false, fetchUsdu: true });
  const selectedPosition = allPositions[selectedCollateral];

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
                  {/* Action Tabs */}
                  <Tabs
                    value={action}
                    onValueChange={(value) => setAction(value as ActionType)}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger
                        value="deposit"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Deposit
                      </TabsTrigger>
                      <TabsTrigger
                        value="withdraw"
                        className="flex items-center gap-2"
                      >
                        <Minus className="h-4 w-4" />
                        Withdraw
                      </TabsTrigger>
                      <TabsTrigger
                        value="claim"
                        className="flex items-center gap-2"
                      >
                        <Gift className="h-4 w-4" />
                        Claim Rewards
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Collateral Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="collateral-select">
                      Select Collateral Pool
                    </Label>
                    <Select
                      value={selectedCollateral}
                      onValueChange={(value) =>
                        setSelectedCollateral(value as CollateralType)
                      }
                      disabled={isSending || isPending}
                    >
                      <SelectTrigger id="collateral-select" className="w-full">
                        <SelectValue placeholder="Select a collateral" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UBTC">
                          <div className="flex items-center gap-2">
                            <img
                              src={UBTC_TOKEN.icon}
                              alt="UBTC"
                              className="w-4 h-4"
                            />
                            <span>UBTC Pool</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="GBTC">
                          <div className="flex items-center gap-2">
                            <img
                              src={GBTC_TOKEN.icon}
                              alt="GBTC"
                              className="w-4 h-4"
                            />
                            <span>GBTC Pool</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

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
                          selectedCollateral={selectedCollateral}
                          claimRewards={claimRewards}
                          selectedPosition={{
                            ...selectedPosition,
                            totalDeposits:
                              allPositions[selectedCollateral]?.totalDeposits ||
                              0,
                          }}
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
                          const userDeposit = selectedPosition.userDeposit || 0;
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
                          selectedCollateral={selectedCollateral}
                          selectedPosition={selectedPosition}
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
                    // Compound Option for Claim
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                          checked={!claimRewards} // Note: inverted because claimRewards=false means compound
                          onCheckedChange={(checked) =>
                            setClaimRewards(!checked)
                          }
                          className="mt-0.5"
                          disabled={isSending || isPending}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-700">
                              Auto-compound USDU rewards
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Compound
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600">
                            Keep your USDU rewards in the pool to earn more
                            instead of withdrawing them to your wallet
                          </p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    // Claim Option for Deposit/Withdraw
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="claim-rewards"
                          checked={claimRewards}
                          onCheckedChange={(checked) =>
                            setClaimRewards(!!checked)
                          }
                          disabled={isSending || isPending}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="claim-rewards"
                            className="text-sm font-medium leading-none cursor-pointer select-none"
                          >
                            Send rewards to wallet
                          </Label>
                          <div className="mt-2 space-y-2">
                            <p className="text-xs text-slate-600">
                              <span className="font-medium text-green-700">
                                ✓ Checked:
                              </span>{" "}
                              Rewards are sent to your wallet
                            </p>
                            <p className="text-xs text-slate-600">
                              <span className="font-medium text-blue-700">
                                ☐ Unchecked:
                              </span>{" "}
                              Rewards are re-deposited to the stability pool (compounding)
                            </p>
                            {action === "withdraw" &&
                              selectedPosition?.userDeposit && (
                                <div className="p-2 bg-amber-50 border border-amber-200 rounded">
                                  <p className="text-xs text-amber-700">
                                    <span className="font-medium">
                                      ⚠️ Note:
                                    </span>{" "}
                                    To fully withdraw from the Stability
                                    Pool, this must be checked
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      {selectedPosition?.rewards &&
                        (selectedPosition.rewards.usdu > 0 ||
                          selectedPosition.rewards.collateral > 0) && (
                          <div
                            className={`ml-6 p-3 rounded-lg ${
                              claimRewards
                                ? "bg-green-50 border border-green-200"
                                : "bg-slate-50 border border-slate-200"
                            }`}
                          >
                            <div className="font-medium text-slate-700 text-xs mb-1">
                              {claimRewards
                                ? "💰 Will be claimed:"
                                : "📊 Available rewards:"}
                            </div>
                            <div className="text-sm font-medium">
                              {selectedPosition.rewards.usdu > 0 && (
                                <div
                                  className={
                                    claimRewards
                                      ? "text-green-700"
                                      : "text-slate-600"
                                  }
                                >
                                  <NumericFormat
                                    displayType="text"
                                    value={selectedPosition.rewards.usdu}
                                    thousandSeparator=","
                                    decimalScale={2}
                                    fixedDecimalScale
                                  />{" "}
                                  USDU{" "}
                                  {!claimRewards &&
                                    action === "deposit" &&
                                    "(→ compounds)"}
                                </div>
                              )}
                              {selectedPosition.rewards.collateral > 0 && (
                                <div
                                  className={
                                    claimRewards
                                      ? "text-green-700"
                                      : "text-slate-600"
                                  }
                                >
                                  <NumericFormat
                                    displayType="text"
                                    value={selectedPosition.rewards.collateral}
                                    thousandSeparator=","
                                    decimalScale={6}
                                    fixedDecimalScale
                                  />{" "}
                                  {selectedCollateral}{" "}
                                  {!claimRewards && "(→ stays claimable)"}
                                </div>
                              )}
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

export default StabilityPool;

export function meta() {
  return [
    { title: "Stability Pool" },
    {
      name: "description",
      content: "Manage your USDU deposits in Stability Pools",
    },
  ];
}
