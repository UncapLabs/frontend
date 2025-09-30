import { useMemo, useCallback } from "react";
import { RedemptionInfo } from "./redemption-info";
import { InterestRateSkeleton } from "./interest-rate-skeleton";
import { ManualRateControls } from "./manual-rate-controls";
import { STRKRebateInfo } from "./strk-rebate-info";
import { Info, AlertTriangle } from "lucide-react";
import {
  useInterestRateVisualizationData,
  useRedemptionRiskOfInterestRate,
  useAverageInterestRate,
} from "~/hooks/use-interest-rate";
import { useCalculatedRebate } from "~/hooks/use-rebate-config";
import { useInterestRateCooldown } from "~/hooks/use-interest-rate-cooldown";
import { getBranchId, type CollateralType } from "~/lib/contracts/constants";
import * as dn from "dnum";
import { RateModeSelector, type RateMode } from "./rate-mode-selector";
export type { RateMode } from "./rate-mode-selector";
import { ManagedStrategy } from "./managed-strategy";
import { useQueryState, parseAsStringEnum } from "nuqs";
import Big from "big.js";

interface InterestRateSelectorProps {
  interestRate: number;
  onInterestRateChange: (rate: number) => void;
  disabled?: boolean;
  borrowAmount?: Big;
  collateralAmount?: Big;
  collateralPriceUSD?: Big;
  collateralType?: CollateralType;
  onRateModeChange?: (mode: RateMode) => void;
  lastInterestRateAdjTime?: number;
  currentInterestRate?: number;
  isZombie?: boolean;
}

export function InterestRateSelector({
  interestRate,
  onInterestRateChange,
  disabled = false,
  borrowAmount,
  collateralAmount,
  collateralPriceUSD,
  collateralType = "GBTC",
  onRateModeChange,
  lastInterestRateAdjTime,
  currentInterestRate,
  isZombie = false,
}: InterestRateSelectorProps) {
  const [rateMode, setRateModeInternal] = useQueryState(
    "rateMode",
    parseAsStringEnum<RateMode>(["manual", "managed"]).withDefault("manual")
  );
  const branchId = getBranchId(collateralType);
  const interestRateDnum = dn.from(interestRate / 100, 18); // Convert percentage to decimal

  const rebateData = useCalculatedRebate(borrowAmount, interestRate);
  const visualizationData = useInterestRateVisualizationData(branchId);
  const redemptionRisk = useRedemptionRiskOfInterestRate(
    branchId,
    interestRateDnum
  );
  const averageRate = useAverageInterestRate(branchId);

  // Use the interest rate cooldown hook
  const interestRateCooldown = useInterestRateCooldown(lastInterestRateAdjTime);
  const hasInterestRateChange =
    currentInterestRate !== undefined && interestRate !== currentInterestRate;

  // Determine loading and data states from tRPC/tanstack-query
  const isLoading = visualizationData.isLoading || visualizationData.isFetching;
  const hasError = visualizationData.isError;
  const hasData = !!visualizationData.data?.chartBars?.length;

  const setRateMode = useCallback(
    (mode: RateMode) => {
      setRateModeInternal(mode);
      onRateModeChange?.(mode);
    },
    [setRateModeInternal, onRateModeChange]
  );

  // Use the data extraction function from ManualRateControls for debt statistics
  const { debtInFront } = useMemo(() => {
    if (!visualizationData.data) {
      return { debtInFront: 0, totalDebt: 0 };
    }

    const currentRateDecimal = dn.toNumber(interestRateDnum);
    const currentBar = visualizationData.data.chartBars?.find(
      (bar: any, index: number) => {
        const nextBar = visualizationData.data.chartBars[index + 1];
        if (!nextBar) {
          return currentRateDecimal >= bar.rate;
        }
        return (
          currentRateDecimal >= bar.rate && currentRateDecimal < nextBar.rate
        );
      }
    );

    return {
      debtInFront: currentBar ? currentBar.debtInFront : 0,
      totalDebt: visualizationData.data.totalDebt || 0,
    };
  }, [visualizationData.data, interestRateDnum]);

  return (
    <div className="bg-white rounded-2xl p-6 mt-4">
      {/* Title with average rate and mode selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <h3 className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight">
              Interest Rate
            </h3>
            <RedemptionInfo variant="modal" />
          </div>
          {averageRate.data !== undefined && averageRate.data !== null && (
            <span className="text-xs text-neutral-500 font-sora leading-3">
              avg: {(averageRate.data * 100).toFixed(2)}%
            </span>
          )}
        </div>
        <RateModeSelector
          mode={rateMode}
          onModeChange={setRateMode}
          disabled={disabled}
        />
      </div>

      <div>
        {rateMode === "manual" ? (
          <>
            <div className="space-y-4">
              {isLoading ? (
                <InterestRateSkeleton />
              ) : hasData ? (
                <>
                  <div className="flex items-start gap-4">
                    <ManualRateControls
                      interestRate={interestRate}
                      onInterestRateChange={onInterestRateChange}
                      borrowAmount={borrowAmount}
                      visualizationData={visualizationData.data}
                      disabled={disabled}
                    />
                  </div>

                  {/* Combined Redemption Risk and Redeemable Before You */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-neutral-800 text-xs font-medium font-sora leading-3">
                        <span className="hidden sm:inline">
                          Redemption Risk:
                        </span>
                        <span className="sm:hidden">Risk:</span>
                      </span>
                      {redemptionRisk.data && (
                        <div
                          className={`px-1.5 sm:px-2 py-3 h-6 flex items-center justify-center rounded-md border ${
                            redemptionRisk.data === "Low"
                              ? "bg-green-500/10 border-green-500/20"
                              : redemptionRisk.data === "Medium"
                              ? "bg-amber-500/10 border-amber-500/20"
                              : redemptionRisk.data === "High"
                              ? "bg-red-500/10 border-red-500/20"
                              : "bg-neutral-100 border-neutral-200"
                          }`}
                        >
                          <span
                            className={`text-xs font-normal font-sora ${
                              redemptionRisk.data === "Low"
                                ? "text-green-700"
                                : redemptionRisk.data === "Medium"
                                ? "text-amber-700"
                                : redemptionRisk.data === "High"
                                ? "text-red-700"
                                : "text-neutral-500"
                            }`}
                          >
                            {redemptionRisk.data}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-neutral-800 text-xs font-medium font-sora leading-3 whitespace-nowrap">
                        <span className="hidden sm:inline">
                          Redeemable before you:
                        </span>
                        <span className="sm:hidden">Ahead:</span>
                      </span>
                      <span className="text-xs font-medium text-neutral-800 font-sora">
                        {debtInFront > 0
                          ? `$${(debtInFront / 1000000).toFixed(2)}M`
                          : "—"}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                // No data or error - show ManualRateControls without chart
                <>
                  <div className="max-w-md">
                    <div>
                      <ManualRateControls
                        interestRate={interestRate}
                        onInterestRateChange={onInterestRateChange}
                        visualizationData={undefined} // No data available
                        disabled={disabled}
                      />
                      {/* Yearly Interest Cost - Display below the interest rate input */}
                      {borrowAmount && borrowAmount.gt(0) && (
                        <div className="mt-2 ml-1">
                          <span className="text-xs text-slate-500">
                            {borrowAmount
                              .times(interestRate)
                              .div(100)
                              .toFixed(2)}{" "}
                            USDU / year
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* STRK Rebate Information */}
            {borrowAmount && borrowAmount.gt(0) && rebateData && (
              <STRKRebateInfo
                yearlyInterestUSD={rebateData.yearlyInterestUSD}
                yearlyRebateUSD={rebateData.yearlyRebateUSD}
                collateralValueUSD={
                  collateralAmount && collateralPriceUSD
                    ? collateralAmount.times(collateralPriceUSD)
                    : undefined
                }
                yearlyCollateralRebateUSD={
                  collateralAmount && collateralPriceUSD
                    ? collateralAmount.times(collateralPriceUSD).times(0.02) // 2% rebate
                    : undefined
                }
              />
            )}

            {/* Interest Rate Cooldown Warning - Only show in manual mode */}
            {hasInterestRateChange && interestRateCooldown.isInCooldown && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-700 space-y-1">
                    <p>
                      <strong>Premature Adjustment Fee:</strong> Changing the
                      interest rate now will incur a fee equal to 7 days of
                      average interest.
                    </p>
                    <p className="text-amber-600">
                      Fee-free adjustment available in{" "}
                      <strong>
                        {interestRateCooldown.remainingTimeFormatted}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* No Fee Notice */}
            {hasInterestRateChange && !interestRateCooldown.isInCooldown && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    No fee for interest rate adjustment
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          // Managed by Telos mode
          <ManagedStrategy
            disabled={disabled}
            borrowAmount={borrowAmount}
            collateralAmount={collateralAmount}
            collateralPriceUSD={collateralPriceUSD}
          />
        )}
      </div>
    </div>
  );
}
