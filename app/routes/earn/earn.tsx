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
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { TokenInput } from "~/components/token-input";
import { useEffect, useCallback } from "react";
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
import {
  useQueryState,
  parseAsFloat,
  parseAsString,
  parseAsBoolean,
} from "nuqs";

type ActionType = "deposit" | "withdraw";

function StabilityPool() {
  const { address } = useAccount();
  const { connectWallet } = useWalletConnect();

  const [action, setAction] = useQueryState(
    "action",
    parseAsString.withDefault("deposit")
  );
  const [selectedCollateral, setSelectedCollateral] = useQueryState(
    "collateral",
    parseAsString.withDefault("UBTC")
  ) as [CollateralType, (value: CollateralType | null) => void];
  const [claimRewards, setClaimRewards] = useQueryState(
    "claim",
    parseAsBoolean.withDefault(true)
  );
  const [amountParam, setAmountParam] = useQueryState("amount", parseAsFloat);

  const form = useForm({
    defaultValues: {
      amount: amountParam ?? (undefined as number | undefined),
    },
    onSubmit: async ({ value }) => {
      if (!value.amount) return;

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
    action: action as "deposit" | "withdraw",
    amount: amount,
    doClaim: claimRewards,
    collateralType: selectedCollateral,
  });

  const allPositions = useAllStabilityPoolPositions();
  const { usdu } = useFetchPrices({ fetchBitcoin: false, fetchUsdu: true });
  
  const selectedPosition = allPositions[selectedCollateral];

  useEffect(() => {
    if (address && amount && amount > 0) {
      form.validateField("amount", "change");
    }
  }, [address, action]);

  const handleComplete = useCallback(() => {
    form.reset();
    setAmountParam(null);
    transactionReset();
  }, [form, transactionReset, setAmountParam]);

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
                    selectedPosition?.rewards &&
                    (selectedPosition.rewards.usdu > 0 ||
                      selectedPosition.rewards.collateral > 0)
                      ? [
                          {
                            label: "Rewards Claimed",
                            value: (
                              <div className="space-y-1">
                                {selectedPosition.rewards.usdu > 0 && (
                                  <div>
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
                                  <div>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="collateral-select">
                        Select Collateral
                      </Label>
                      <Select
                        value={selectedCollateral}
                        onValueChange={(value) =>
                          setSelectedCollateral(value as CollateralType)
                        }
                        disabled={isSending || isPending}
                      >
                        <SelectTrigger
                          id="collateral-select"
                          className="w-full"
                        >
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
                              <span>UBTC</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="GBTC">
                            <div className="flex items-center gap-2">
                              <img
                                src={GBTC_TOKEN.icon}
                                alt="GBTC"
                                className="w-4 h-4"
                              />
                              <span>GBTC</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="action-select">Select Action</Label>
                      <Select
                        value={action}
                        onValueChange={(value) =>
                          setAction(value as ActionType)
                        }
                        disabled={isSending || isPending}
                      >
                        <SelectTrigger id="action-select" className="w-full">
                          <SelectValue placeholder="Select an action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deposit">Deposit USDU</SelectItem>
                          <SelectItem value="withdraw">
                            Withdraw USDU
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <form.Field
                    name="amount"
                    asyncDebounceMs={300}
                    validators={{
                      onChangeAsync: async ({ value }) => {
                        if (!address || !value) return undefined;

                        if (action === "deposit") {
                          if (!usduBalance) return undefined;
                          const balance =
                            Number(usduBalance.value) /
                            10 ** USDU_TOKEN.decimals;
                          return validators.compose(
                            validators.insufficientBalance(value, balance)
                          );
                        } else {
                          const userDeposit =
                            selectedPosition?.userDeposit || 0;
                          return validators.compose(
                            validators.insufficientBalance(value, userDeposit)
                          );
                        }
                      },
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <TokenInput
                          token={USDU_TOKEN}
                          balance={
                            action === "deposit" ? usduBalance : undefined
                          }
                          price={usdu}
                          value={field.state.value}
                          onChange={(value) => {
                            field.handleChange(value);
                            setAmountParam(value || null);
                          }}
                          onBlur={field.handleBlur}
                          label={
                            action === "deposit"
                              ? "Deposit amount"
                              : "Withdraw amount"
                          }
                          percentageButtons
                          onPercentageClick={(percentage) => {
                            if (action === "deposit") {
                              const balance = usduBalance?.value
                                ? Number(usduBalance.value) /
                                  10 ** USDU_TOKEN.decimals
                                : 0;
                              const newValue = balance * percentage;
                              field.handleChange(newValue);
                              setAmountParam(newValue || null);
                            } else {
                              const userDeposit =
                                selectedPosition?.userDeposit || 0;
                              const newValue = userDeposit * percentage;
                              field.handleChange(newValue);
                              setAmountParam(newValue || null);
                            }
                          }}
                          disabled={isSending || isPending}
                          includeMax={true}
                        />

                        {action === "deposit" &&
                          field.state.value &&
                          field.state.value > 0 &&
                          selectedPosition && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-blue-700 font-medium">
                                  Projected Pool Share
                                </span>
                                <span className="font-semibold text-blue-900">
                                  <NumericFormat
                                    displayType="text"
                                    value={
                                      (allPositions[selectedCollateral]?.totalDeposits || 0) > 0
                                        ? (((selectedPosition?.userDeposit ||
                                            0) +
                                            field.state.value) /
                                            ((allPositions[selectedCollateral]?.totalDeposits || 0) +
                                              field.state.value)) *
                                          100
                                        : 100
                                    }
                                    decimalScale={3}
                                    suffix="%"
                                  />
                                </span>
                              </div>
                              {usdu?.price && (
                                <div className="mt-2 text-xs text-blue-600">
                                  Value: $
                                  <NumericFormat
                                    displayType="text"
                                    value={field.state.value * usdu.price}
                                    thousandSeparator=","
                                    decimalScale={2}
                                    fixedDecimalScale
                                  />
                                </div>
                              )}
                            </div>
                          )}

                        {action === "withdraw" &&
                          selectedPosition?.userDeposit &&
                          selectedPosition.userDeposit > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">
                                Deposited in pool:
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  field.handleChange(
                                    selectedPosition.userDeposit
                                  );
                                  setAmountParam(
                                    selectedPosition.userDeposit || null
                                  );
                                  setClaimRewards(true);
                                }}
                                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                {selectedPosition.userDeposit.toLocaleString()}{" "}
                                USDU
                                {usdu?.price && (
                                  <span className="text-slate-500 ml-1">
                                    ($
                                    <NumericFormat
                                      displayType="text"
                                      value={
                                        selectedPosition.userDeposit *
                                        usdu.price
                                      }
                                      thousandSeparator=","
                                      decimalScale={0}
                                    />
                                    )
                                  </span>
                                )}
                              </button>
                            </div>
                          )}
                      </div>
                    )}
                  </form.Field>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
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
                        className="text-sm font-medium leading-none cursor-pointer select-none"
                      >
                        {action === "deposit"
                          ? "Claim existing rewards when depositing"
                          : "Claim rewards when withdrawing"}
                      </Label>
                    </div>
                    <p className="text-xs text-slate-500 ml-6">
                      {action === "deposit"
                        ? `If unchecked, USDU rewards will be compounded into your deposit and ${selectedCollateral} rewards will be saved for later claiming.`
                        : `If checked, your USDU and ${selectedCollateral} rewards will be sent to your wallet. If unchecked, they'll remain in the pool for later claiming.`}
                    </p>
                    {selectedPosition?.rewards && claimRewards && (
                      <div className="ml-6 p-2 bg-slate-50 rounded text-xs">
                        <div className="font-medium text-slate-700">
                          Rewards to claim:
                        </div>
                        <div className="text-slate-600 mt-1">
                          <NumericFormat
                            displayType="text"
                            value={selectedPosition.rewards.usdu}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />{" "}
                          USDU +{" "}
                          <NumericFormat
                            displayType="text"
                            value={selectedPosition.rewards.collateral}
                            thousandSeparator=","
                            decimalScale={6}
                            fixedDecimalScale
                          />{" "}
                          {selectedCollateral}
                        </div>
                      </div>
                    )}
                  </div>

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
                            : "Withdraw USDU";

                        if (!address) {
                          buttonText = "Connect Wallet";
                        } else if (errors.length > 0) {
                          buttonText = errors[0];
                        } else if (!amount) {
                          buttonText =
                            action === "deposit"
                              ? "Enter deposit amount"
                              : "Enter withdraw amount";
                        } else if (
                          action === "withdraw" &&
                          (selectedPosition?.userDeposit ?? 0) === 0
                        ) {
                          buttonText = "No deposit in this pool";
                        }

                        return (
                          <Button
                            type={address ? "submit" : "button"}
                            onClick={!address ? connectWallet : undefined}
                            disabled={
                              address &&
                              (!amount ||
                                amount <= 0 ||
                                (action === "withdraw" &&
                                  (selectedPosition?.userDeposit ?? 0) === 0) ||
                                isSending ||
                                isPending ||
                                !canSubmit)
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
