import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { InterestRateSelector } from "~/components/borrow";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { useMemo, useEffect } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { type BorrowFormData } from "~/types/borrow";
import { getAnnualInterestRate } from "~/lib/utils/calc";
import type { Route } from "./+types/borrow.$troveId.rate";
import { useParams, useNavigate } from "react-router";
import { useAccount, useConnect, type Connector } from "@starknet-react/core";
import {
  type StarknetkitConnector,
  useStarknetkitConnectModal,
} from "starknetkit";
import {
  INTEREST_RATE_SCALE_DOWN_FACTOR,
  TBTC_TOKEN,
  LBTC_TOKEN,
} from "~/lib/contracts/constants";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { useAdjustTrove } from "~/hooks/use-adjust-trove";
import { useTroveData } from "~/hooks/use-trove-data";
import { useQueryState } from "nuqs";
import { formatDistanceToNow } from "date-fns";

function InterestRateAdjustment() {
  const { address } = useAccount();
  const { troveId } = useParams();
  const navigate = useNavigate();
  const { connect, connectors } = useConnect();
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as StarknetkitConnector[],
  });

  // Fetch existing trove data
  const { troveData, isLoading: isTroveLoading } = useTroveData(troveId);

  // Check if we have a transaction hash in URL
  const [urlTransactionHash, setUrlTransactionHash] = useQueryState("tx", {
    defaultValue: "",
  });

  // Available collateral tokens (to determine which one the trove uses)
  const collateralTokens = [TBTC_TOKEN, LBTC_TOKEN];

  // Get the collateral token from trove data (for now default to TBTC)
  const selectedCollateralToken = TBTC_TOKEN; // TODO: Get from trove data

  // Create properly typed default values from existing trove
  const defaultFormValues: Partial<BorrowFormData> = useMemo(
    () => ({
      interestRate: troveData
        ? Number(troveData.annualInterestRate) /
          Number(INTEREST_RATE_SCALE_DOWN_FACTOR)
        : 5,
    }),
    [troveData]
  );

  // Form setup with TanStack Form
  const form = useForm({
    defaultValues: defaultFormValues,
    onSubmit: async ({ value }) => {
      if (!isReady) {
        if (!address) {
          toast.error("Please connect your wallet");
        }
        return;
      }

      if (!value.interestRate) {
        return;
      }

      try {
        await send();
      } catch (error) {
        console.error("Transaction error:", error);
      }
    },
  });

  // Reset form when trove data loads
  useEffect(() => {
    if (troveData) {
      form.reset({
        interestRate:
          Number(troveData.annualInterestRate) /
          Number(INTEREST_RATE_SCALE_DOWN_FACTOR),
      });
    }
  }, [troveData]);

  // Get form values reactively
  const interestRate = useStore(
    form.store,
    (state) => state.values.interestRate
  );

  // Use the adjust trove hook
  const {
    send,
    isPending,
    isSending,
    isError: isTransactionError,
    error: transactionError,
    transactionHash,
    isReady,
    isSuccess: isTransactionSuccess,
    changes,
  } = useAdjustTrove({
    troveId: troveData?.troveId,
    currentCollateral: troveData?.collateral,
    currentDebt: troveData?.debt,
    currentInterestRate: troveData?.annualInterestRate,
    newCollateral: troveData?.collateral, // Keep same
    newDebt: troveData?.debt, // Keep same
    newInterestRate: interestRate
      ? getAnnualInterestRate(interestRate)
      : undefined,
    collateralToken: selectedCollateralToken,
  });

  const handleComplete = () => {
    navigate("/positions");
  };

  // Handle wallet connection
  const connectWallet = async () => {
    const { connector } = await starknetkitConnectModal();
    if (!connector) {
      return;
    }
    connect({ connector: connector as Connector });
  };

  // Update URL when we get a transaction hash
  if (transactionHash && transactionHash !== urlTransactionHash) {
    setUrlTransactionHash(transactionHash);
  }

  // Show transaction UI if we have a hash in URL (single source of truth)
  const shouldShowTransactionUI = !!urlTransactionHash;

  // Calculate cooldown and fee information
  const lastUpdateTime = troveData?.lastInterestRateAdjTime
    ? Number(troveData.lastInterestRateAdjTime)
    : 0;
  const timeSinceLastUpdate = lastUpdateTime
    ? formatDistanceToNow(new Date(lastUpdateTime * 1000), { addSuffix: true })
    : null;
  const cooldownPeriod = 7 * 24 * 60 * 60; // 7 days in seconds
  const remainingCooldown = lastUpdateTime
    ? Math.max(0, cooldownPeriod - (Date.now() / 1000 - lastUpdateTime))
    : 0;
  const isInCooldown = remainingCooldown > 0;
  const cooldownDays = Math.ceil(remainingCooldown / (24 * 60 * 60));

  // Calculate fee (example calculation - adjust based on actual fee structure)
  const baseFee = 0.5; // 0.5% base fee
  const cooldownFee = isInCooldown ? 1.0 : 0; // 1% additional fee during cooldown
  const totalFee = baseFee + cooldownFee;

  if (isTroveLoading || !troveData) {
    return (
      <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="flex justify-between items-baseline">
          <h1 className="text-3xl font-bold mb-2 text-slate-800">
            Adjust Interest Rate
          </h1>
        </div>
        <Separator className="mb-8 bg-slate-200" />
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-600">Loading trove data...</p>
        </div>
      </div>
    );
  }

  // Calculate redemption risk based on interest rate
  const getRedemptionRisk = (rate: number) => {
    if (rate < 5) return { level: "High", color: "text-red-600" };
    if (rate < 10) return { level: "Medium", color: "text-yellow-600" };
    return { level: "Low", color: "text-green-600" };
  };

  const currentRisk = getRedemptionRisk(interestRate || 5);
  const annualInterestCost = (troveData.debt * (interestRate || 5)) / 100;

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/borrow/${troveId}`)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold mb-2 text-slate-800">
            Adjust Interest Rate
          </h1>
        </div>
      </div>
      <Separator className="mb-8 bg-slate-200" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Panel */}
        <div className="md:col-span-2">
          {shouldShowTransactionUI ? (
            <TransactionStatus
              transactionHash={transactionHash}
              isError={isTransactionError}
              isSuccess={isTransactionSuccess}
              error={transactionError}
              successTitle="Interest Rate Updated!"
              successSubtitle="Your interest rate has been adjusted successfully."
              details={[
                {
                  label: "New Interest Rate",
                  value: `${interestRate}% APR`,
                },
              ]}
              onComplete={handleComplete}
              completeButtonText="View Positions"
            />
          ) : (
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                >
                  <div className="space-y-6">
                    {/* Current Rate Info */}
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                      <h3 className="font-medium text-slate-700">
                        Current Interest Rate
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-semibold text-slate-800">
                          {Number(troveData.annualInterestRate) /
                            Number(INTEREST_RATE_SCALE_DOWN_FACTOR)}
                          %
                        </span>
                        <span className="text-sm text-slate-600">APR</span>
                      </div>
                      {timeSinceLastUpdate && (
                        <p className="text-sm text-slate-600">
                          Last updated {timeSinceLastUpdate}
                        </p>
                      )}
                    </div>

                    {/* Cooldown Warning */}
                    {isInCooldown && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="font-medium text-amber-800 mb-1">
                          Cooldown Period Active
                        </h4>
                        <p className="text-sm text-amber-700">
                          Free update available in {cooldownDays} days. Updating
                          now will incur a {totalFee}% fee.
                        </p>
                      </div>
                    )}

                    {/* Interest Rate Selector */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-slate-700">
                        New Interest Rate
                      </h3>
                      <InterestRateSelector
                        interestRate={interestRate || 5}
                        onInterestRateChange={(rate) => {
                          if (!isSending && !isPending) {
                            form.setFieldValue("interestRate", rate);
                          }
                        }}
                        disabled={isSending || isPending}
                      />
                    </div>

                    {/* Preview Section */}
                    {interestRate !== undefined && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                        <h4 className="font-medium text-blue-800">
                          Preview Changes
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">
                              Annual Interest Cost:
                            </span>
                            <span className="font-medium text-blue-800">
                              <NumericFormat
                                displayType="text"
                                value={annualInterestCost}
                                thousandSeparator=","
                                decimalScale={2}
                                fixedDecimalScale
                              />{" "}
                              bitUSD/year
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">
                              Redemption Risk:
                            </span>
                            <span
                              className={`font-medium ${currentRisk.color}`}
                            >
                              {currentRisk.level}
                            </span>
                          </div>
                          {totalFee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-blue-700">Update Fee:</span>
                              <span className="font-medium text-blue-800">
                                {totalFee}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Update Button */}
                    <div className="mt-6">
                      <Button
                        type={address ? "submit" : "button"}
                        onClick={!address ? connectWallet : undefined}
                        disabled={
                          address &&
                          (isSending ||
                            isPending ||
                            !changes?.hasInterestRateChange)
                        }
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-6 rounded-xl shadow-sm hover:shadow transition-all"
                      >
                        {isSending
                          ? "Confirm in wallet..."
                          : isPending
                          ? "Updating..."
                          : !changes?.hasInterestRateChange
                          ? "No changes made"
                          : "Update Interest Rate"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Info Card */}
        <div className="md:col-span-1">
          <Card className="border border-slate-200 shadow-sm sticky top-8">
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg text-slate-800">
                Interest Rate Guide
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-slate-700 mb-1">
                    Redemption Protection
                  </h4>
                  <p className="text-slate-600">
                    Higher interest rates reduce your redemption risk. Positions
                    with lower rates are redeemed first.
                  </p>
                </div>

                <Separator className="bg-slate-100" />

                <div>
                  <h4 className="font-medium text-slate-700 mb-1">
                    Rate Recommendations
                  </h4>
                  <ul className="space-y-1 text-slate-600">
                    <li>
                      • <span className="text-green-600">10%+</span> - Low risk
                    </li>
                    <li>
                      • <span className="text-yellow-600">5-10%</span> - Medium
                      risk
                    </li>
                    <li>
                      • <span className="text-red-600">&lt;5%</span> - High risk
                    </li>
                  </ul>
                </div>

                <Separator className="bg-slate-100" />

                <div>
                  <h4 className="font-medium text-slate-700 mb-1">
                    Update Fees
                  </h4>
                  <p className="text-slate-600">
                    Free updates every 7 days. Early updates incur a 1.5% fee.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default InterestRateAdjustment;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Adjust Interest Rate - BitUSD" },
    { name: "description", content: "Adjust your position's interest rate" },
  ];
}
