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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { TokenInput } from "~/components/token-input";
import { useEffect, useCallback, useState, useMemo } from "react";
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
import {
  useDepositToStabilityPool,
  useWithdrawFromStabilityPool,
  useAllStabilityPoolPositions,
} from "~/hooks/use-stability-pool";
import { useWalletConnect } from "~/hooks/use-wallet-connect";
import { validators } from "~/lib/validators";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import { useAverageInterestRate } from "~/hooks/use-interest-rate";
import { useBranchTCR } from "~/hooks/use-branch-tcr";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";

type ActionType = "deposit" | "withdraw";

function StabilityPool() {
  const { address } = useAccount();
  const { connectWallet } = useWalletConnect();

  // State for action and collateral selection
  const [action, setAction] = useState<ActionType>("deposit");
  const [selectedCollateral, setSelectedCollateral] =
    useState<CollateralType>("UBTC");
  const [claimRewards, setClaimRewards] = useState(true);

  // Form state
  const form = useForm({
    defaultValues: {
      amount: undefined as number | undefined,
    },
    onSubmit: async ({ value }) => {
      if (!value.amount) return;

      try {
        if (action === "deposit") {
          if (!depositReady) {
            if (!address) {
              toast.error("Please connect your wallet");
            }
            return;
          }
          await deposit();
        } else {
          if (!withdrawReady) {
            if (!address) {
              toast.error("Please connect your wallet");
            }
            return;
          }
          await withdraw();
        }
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

  // Deposit hook
  const {
    deposit,
    isPending: depositPending,
    isSending: depositSending,
    error: depositError,
    transactionHash: depositHash,
    isReady: depositReady,
    currentState: depositState,
    formData: depositFormData,
    reset: depositReset,
  } = useDepositToStabilityPool({
    amount: amount,
    doClaim: claimRewards,
    collateralType: selectedCollateral,
  });

  // Withdraw hook
  const {
    withdraw,
    isPending: withdrawPending,
    isSending: withdrawSending,
    error: withdrawError,
    transactionHash: withdrawHash,
    isReady: withdrawReady,
    currentState: withdrawState,
    formData: withdrawFormData,
    reset: withdrawReset,
  } = useWithdrawFromStabilityPool({
    amount: amount,
    doClaim: claimRewards,
    collateralType: selectedCollateral,
  });

  // Combined states
  const isPending = action === "deposit" ? depositPending : withdrawPending;
  const isSending = action === "deposit" ? depositSending : withdrawSending;
  const transactionError = action === "deposit" ? depositError : withdrawError;
  const transactionHash = action === "deposit" ? depositHash : withdrawHash;
  const currentState = action === "deposit" ? depositState : withdrawState;
  const formData = action === "deposit" ? depositFormData : withdrawFormData;

  // Fetch all stability pool positions at once
  const allPositions = useAllStabilityPoolPositions();

  // Fetch USDU price
  const { usdu } = useFetchPrices({ fetchBitcoin: false, fetchUsdu: true });

  // tRPC client
  const trpc = useTRPC();

  // Fetch total deposits for each pool (available even when wallet disconnected)
  const ubtcTotalDepositsQuery = useQuery({
    ...trpc.stabilityPoolRouter.getTotalDeposits.queryOptions({
      collateralType: "UBTC",
    }),
    refetchInterval: 30000,
  });
  const gbtcTotalDepositsQuery = useQuery({
    ...trpc.stabilityPoolRouter.getTotalDeposits.queryOptions({
      collateralType: "GBTC",
    }),
    refetchInterval: 30000,
  });

  // Fetch average interest rates (per branch)
  const ubtcAverageRateQuery = useAverageInterestRate(0); // UBTC => branch 0
  const gbtcAverageRateQuery = useAverageInterestRate(1); // GBTC => branch 1

  // Fetch branch totals (includes totalDebt which we use as USDU supply proxy)
  const ubtcBranchQuery = useBranchTCR("UBTC");
  const gbtcBranchQuery = useBranchTCR("GBTC");

  const computeApr = useCallback(
    (avgRate?: number, usduSupply?: number, totalDeposits?: number) => {
      if (!avgRate || avgRate <= 0) return 0;
      if (!usduSupply || usduSupply <= 0) return 0;
      if (!totalDeposits || totalDeposits <= 0) return 0;
      const aprDecimal = 0.75 * avgRate * (usduSupply / totalDeposits);
      return aprDecimal * 100; // convert to percentage
    },
    []
  );

  const computedAprs = useMemo(() => {
    const ubtcTotalDeposits =
      ubtcTotalDepositsQuery.data ?? allPositions.UBTC.totalDeposits ?? 0;
    const gbtcTotalDeposits =
      gbtcTotalDepositsQuery.data ?? allPositions.GBTC.totalDeposits ?? 0;

    const ubtcAvgRate = ubtcAverageRateQuery.data; // decimal (e.g., 0.05)
    const gbtcAvgRate = gbtcAverageRateQuery.data; // decimal (e.g., 0.05)

    const ubtcUsduSupply = ubtcBranchQuery.data?.totalDebt; // number
    const gbtcUsduSupply = gbtcBranchQuery.data?.totalDebt; // number

    return {
      UBTC: computeApr(ubtcAvgRate, ubtcUsduSupply, ubtcTotalDeposits),
      GBTC: computeApr(gbtcAvgRate, gbtcUsduSupply, gbtcTotalDeposits),
    } as const;
  }, [
    ubtcTotalDepositsQuery.data,
    gbtcTotalDepositsQuery.data,
    allPositions.UBTC.totalDeposits,
    allPositions.GBTC.totalDeposits,
    ubtcAverageRateQuery.data,
    gbtcAverageRateQuery.data,
    ubtcBranchQuery.data?.totalDebt,
    gbtcBranchQuery.data?.totalDebt,
    computeApr,
  ]);

  // Build pool data with actual contract data
  const poolsData = [
    {
      collateralType: "UBTC" as CollateralType,
      token: UBTC_TOKEN,
      totalDeposits:
        ubtcTotalDepositsQuery.data ?? allPositions.UBTC.totalDeposits,
      apr: computedAprs.UBTC,
      userDeposit: allPositions.UBTC.userDeposit,
      rewards: allPositions.UBTC.rewards,
      poolShare: allPositions.UBTC.poolShare,
    },
    {
      collateralType: "GBTC" as CollateralType,
      token: GBTC_TOKEN,
      totalDeposits:
        gbtcTotalDepositsQuery.data ?? allPositions.GBTC.totalDeposits,
      apr: computedAprs.GBTC,
      userDeposit: allPositions.GBTC.userDeposit,
      rewards: allPositions.GBTC.rewards,
      poolShare: allPositions.GBTC.poolShare,
    },
  ];

  const selectedPool = poolsData.find(
    (p) => p.collateralType === selectedCollateral
  );

  // Revalidate when wallet connects
  useEffect(() => {
    if (address && amount && amount > 0) {
      form.validateField("amount", "change");
    }
  }, [address, action]);

  const handleComplete = useCallback(() => {
    form.reset();
    if (action === "deposit") {
      depositReset();
    } else {
      withdrawReset();
    }
  }, [form, action, depositReset, withdrawReset]);

  return (
    <div className="mx-auto max-w-6xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <h1 className="text-3xl font-bold mb-2 text-slate-800">
          Stability Pool
        </h1>
      </div>
      <Separator className="mb-8 bg-slate-200" />

      <div className="space-y-6">
        {/* Stability Pools Overview Table - Always visible */}
        <Card className="border border-slate-200">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Stability Pools Overview
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Earn liquidation rewards by depositing USDU into stability
                  pools
                </p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pool</TableHead>
                    <TableHead className="text-right">Total Deposits</TableHead>
                    <TableHead className="text-right">Supply APR</TableHead>
                    <TableHead className="text-right">Your Deposit</TableHead>
                    <TableHead className="text-right">
                      Claimable Rewards
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {poolsData.map((pool) => (
                    <TableRow
                      key={pool.collateralType}
                      className={
                        pool.collateralType === selectedCollateral
                          ? "bg-slate-50"
                          : ""
                      }
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={pool.token.icon}
                            alt={pool.token.symbol}
                            className="w-5 h-5"
                          />
                          <span className="font-medium">
                            {pool.token.symbol}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <NumericFormat
                            displayType="text"
                            value={pool.totalDeposits}
                            thousandSeparator=","
                            decimalScale={0}
                            suffix=" USDU"
                          />
                          {usdu?.price && (
                            <div className="text-xs text-slate-500">
                              $
                              <NumericFormat
                                displayType="text"
                                value={pool.totalDeposits * usdu.price}
                                thousandSeparator=","
                                decimalScale={0}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-green-600">
                          <NumericFormat
                            displayType="text"
                            value={pool.apr}
                            decimalScale={2}
                          />
                          %
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {address && pool.userDeposit > 0 ? (
                          <div>
                            <NumericFormat
                              displayType="text"
                              value={pool.userDeposit}
                              thousandSeparator=","
                              suffix=" USDU"
                              decimalScale={0}
                            />
                            {usdu?.price && (
                              <div className="text-xs text-slate-500">
                                $
                                <NumericFormat
                                  displayType="text"
                                  value={pool.userDeposit * usdu.price}
                                  thousandSeparator=","
                                  decimalScale={0}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {address && pool.userDeposit > 0 ? (
                          <div className="text-sm">
                            <div>{pool.rewards.usdu} USDU</div>
                            <div className="text-slate-500">
                              {pool.rewards.collateral} {pool.token.symbol}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Show transaction status or form */}
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
            {/* Action Form */}
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
                  {/* Action and Pool Selection */}
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
                          const userDeposit = selectedPool?.userDeposit || 0;
                          return validators.compose(
                            value > userDeposit
                              ? "Insufficient deposited balance"
                              : undefined
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
                            } else {
                              const userDeposit =
                                selectedPool?.userDeposit || 0;
                              const newValue = userDeposit * percentage;
                              field.handleChange(newValue);
                            }
                          }}
                          disabled={isSending || isPending}
                          includeMax={true}
                        />
                        
                        {/* Projected Pool Share for Deposits */}
                        {action === "deposit" &&
                          field.state.value &&
                          field.state.value > 0 &&
                          selectedPool && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-blue-700 font-medium">
                                  Projected Pool Share
                                </span>
                                <span className="font-semibold text-blue-900">
                                  <NumericFormat
                                    displayType="text"
                                    value={
                                      selectedPool.totalDeposits > 0
                                        ? ((selectedPool.userDeposit + field.state.value) /
                                            (selectedPool.totalDeposits + field.state.value)) *
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
                          selectedPool &&
                          selectedPool.userDeposit > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">
                                Deposited in pool:
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  field.handleChange(selectedPool.userDeposit);
                                  setClaimRewards(true);
                                }}
                                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                {selectedPool.userDeposit.toLocaleString()} USDU
                                {usdu?.price && (
                                  <span className="text-slate-500 ml-1">
                                    ($
                                    <NumericFormat
                                      displayType="text"
                                      value={
                                        selectedPool.userDeposit * usdu.price
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

                  {/* Claim Rewards Checkbox */}
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
                    {selectedPool && selectedPool.rewards && claimRewards && (
                      <div className="ml-6 p-2 bg-slate-50 rounded text-xs">
                        <div className="font-medium text-slate-700">
                          Rewards to claim:
                        </div>
                        <div className="text-slate-600 mt-1">
                          {selectedPool.rewards.usdu} USDU +{" "}
                          {selectedPool.rewards.collateral} {selectedCollateral}
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
                          selectedPool &&
                          selectedPool.userDeposit === 0
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
                                  selectedPool &&
                                  selectedPool.userDeposit === 0) ||
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

// Meta function for React Router
export function meta() {
  return [
    { title: "Stability Pool" },
    {
      name: "description",
      content: "Manage your USDU deposits in Stability Pools",
    },
  ];
}
