import { useMemo, useCallback } from "react";
import { RedemptionInfo } from "./redemption-info";
import { InterestRateSkeleton } from "./interest-rate-skeleton";
import { ManualRateControls } from "./manual-rate-controls";
import { RiskIndicator } from "./risk-indicator";
import { DebtStatistics } from "./debt-statistics";
import { STRKRebateInfo } from "./strk-rebate-info";
import { Info, AlertTriangle } from "lucide-react";
import {
  useInterestRateVisualizationData,
  useRedemptionRiskOfInterestRate,
  useAverageInterestRate,
} from "~/hooks/useInterestRate";
import { useCalculatedRebate } from "~/hooks/use-rebate-config";
import { useInterestRateCooldown } from "~/hooks/use-interest-rate-cooldown";
import { getBranchId, type CollateralType } from "~/lib/contracts/constants";
import { type RiskLevel } from "~/lib/interest-rate-visualization";
import * as dn from "dnum";
import { RateModeSelector, type RateMode } from "./rate-mode-selector";
export type { RateMode } from "./rate-mode-selector";
import { ManagedStrategy } from "./managed-strategy";
import { useQueryState, parseAsStringEnum } from "nuqs";

interface InterestRateSelectorProps {
  interestRate: number;
  onInterestRateChange: (rate: number) => void;
  disabled?: boolean;
  borrowAmount?: number;
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
  const { debtInFront, totalDebt } = useMemo(() => {
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
    <div className="space-y-3 mt-6">
      {/* Title with average rate and mode selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-medium text-slate-700">Interest Rate</h3>
          <RedemptionInfo variant="modal" />
          {rateMode === "manual" &&
            averageRate.data !== undefined &&
            averageRate.data !== null && (
              <span className="text-xs text-slate-500">
                (avg: {(averageRate.data * 100).toFixed(2)}%)
              </span>
            )}
        </div>
        <RateModeSelector
          mode={rateMode}
          onModeChange={setRateMode}
          disabled={disabled}
        />
      </div>

      <div className="bg-slate-50 rounded-lg p-4">
        {rateMode === "manual" ? (
          <>
            <p className="text-xs text-slate-600 mb-4">
              Set your interest rate. Raising the interest rate reduces your
              redemption risk.
            </p>

            <div className="mb-4">
              {isLoading ? (
                <InterestRateSkeleton />
              ) : hasData ? (
                <>
                  <div>
                    <ManualRateControls
                      interestRate={interestRate}
                      onInterestRateChange={onInterestRateChange}
                      visualizationData={visualizationData.data}
                      disabled={disabled}
                    />
                    {/* Yearly Interest Cost - Display below the interest rate input */}
                    {borrowAmount && borrowAmount > 0 && (
                      <div className="mt-2 ml-1">
                        <span className="text-xs text-slate-500">
                          {((borrowAmount * interestRate) / 100).toLocaleString('en-US', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })} USDU / year
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Combined Redemption Risk and Redeemable Before You */}
                  <div className="flex items-center justify-between mt-3 py-2 px-3 bg-white rounded-md border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">Redemption Risk:</span>
                      <span className={`text-xs font-medium ${
                        redemptionRisk.data === "Low" ? "text-green-600" :
                        redemptionRisk.data === "Medium" ? "text-amber-600" :
                        redemptionRisk.data === "High" ? "text-red-600" :
                        "text-slate-400"
                      }`}>
                        {redemptionRisk.data || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">Redeemable before you:</span>
                      <span className="text-xs font-medium text-slate-900">
                        {debtInFront > 0 ? `$${(debtInFront / 1000000).toFixed(2)}M` : "—"}
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
                      {borrowAmount && borrowAmount > 0 && (
                        <div className="mt-2 ml-1">
                          <span className="text-xs text-slate-500">
                            {((borrowAmount * interestRate) / 100).toLocaleString('en-US', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            })} USDU / year
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 text-center mt-2">
                      {hasError
                        ? "Unable to load distribution data"
                        : "No distribution data available yet"}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* STRK Rebate Information */}
            {borrowAmount && borrowAmount > 0 && rebateData && (
              <STRKRebateInfo
                yearlyInterestUSD={rebateData.yearlyInterestUSD}
                effectiveYearlyInterestUSD={
                  rebateData.effectiveYearlyInterestUSD
                }
                yearlyRebateUSD={rebateData.yearlyRebateUSD}
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
          <ManagedStrategy disabled={disabled} borrowAmount={borrowAmount} />
        )}
      </div>
    </div>
  );
}
