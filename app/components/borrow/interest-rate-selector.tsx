import { useMemo, useCallback } from "react";
import { InterestSlider } from "~/components/borrow/interest-slider";
import { RedemptionInfo } from "./redemption-info";
import { NumericFormat } from "react-number-format";
import { Info, AlertTriangle, CheckCircle } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import {
  useInterestRateVisualizationData,
  useRedemptionRiskOfInterestRate,
  useAverageInterestRate,
} from "~/hooks/useInterestRate";
import { getBranchId, type CollateralType } from "~/lib/contracts/constants";
import { type Dnum } from "~/lib/interest-rate-utils";
import { 
  riskLevelToHandleColor, 
  findPositionInChart,
  getRateFromPosition,
  type RiskLevel 
} from "~/lib/interest-rate-visualization";
import * as dn from "dnum";

interface InterestRateSelectorProps {
  interestRate: number;
  onInterestRateChange: (rate: number) => void;
  disabled?: boolean;
  borrowAmount?: number;
  isLoadingRebate?: boolean;
  rebateData?: {
    rebatePercentage: number;
    interestRate: number;
    effectiveInterestRate: number;
    yearlyInterestUSD: number;
    effectiveYearlyInterestUSD: number;
    yearlyRebateUSD: number;
  };
  collateralType?: CollateralType;
}

export function InterestRateSelector({
  interestRate,
  onInterestRateChange,
  disabled = false,
  borrowAmount,
  isLoadingRebate = false,
  rebateData,
  collateralType = "GBTC", // Default to GBTC for backwards compatibility
}: InterestRateSelectorProps) {
  const effectiveRate = rebateData?.effectiveInterestRate ?? interestRate;

  // Convert interest rate to Dnum for the hooks
  const interestRateDnum = dn.from(interestRate / 100, 18); // Convert percentage to decimal

  // Get branchId from collateralType
  const branchId = getBranchId(collateralType);
  
  // Use the enhanced visualization data endpoint
  const visualizationData = useInterestRateVisualizationData(branchId);
  const redemptionRisk = useRedemptionRiskOfInterestRate(
    branchId,
    interestRateDnum
  );
  const averageRate = useAverageInterestRate(branchId);
  
  // Process chart data and calculate debt statistics
  const { chartSizes, riskZones, sliderValue, debtInFront, totalDebt } = useMemo(() => {
    if (!visualizationData.data) {
      return {
        chartSizes: [],
        riskZones: { highRiskThreshold: 0.1, mediumRiskThreshold: 0.25 },
        sliderValue: 0,
        debtInFront: 0,
        totalDebt: 0,
      };
    }

    // Data is already normalized from the server!
    const sizes = visualizationData.data.chartBars.map((bar: any) => bar.normalized);
    
    // Find current position in the chart
    const currentRateDecimal = dn.toNumber(interestRateDnum); // Convert to decimal
    const sliderPos = findPositionInChart(
      currentRateDecimal, 
      visualizationData.data.chartBars
    );

    // Calculate debt in front based on current interest rate
    // Find the bar that contains our current rate
    const currentBar = visualizationData.data.chartBars.find((bar: any, index: number) => {
      const nextBar = visualizationData.data.chartBars[index + 1];
      if (!nextBar) {
        // Last bar - check if rate is >= this bar's rate
        return currentRateDecimal >= bar.rate;
      }
      // Check if rate falls between this bar and next
      return currentRateDecimal >= bar.rate && currentRateDecimal < nextBar.rate;
    });

    const debtInFrontValue = currentBar ? currentBar.debtInFront : 0;
    const totalDebtValue = visualizationData.data.totalDebt;

    return {
      chartSizes: sizes,
      riskZones: visualizationData.data.riskZones,
      sliderValue: sliderPos,
      debtInFront: debtInFrontValue,
      totalDebt: totalDebtValue,
    };
  }, [visualizationData.data, interestRateDnum]);

  // Handle slider value change - now simpler with clean data
  const handleSliderChange = useCallback(
    (value: number) => {
      if (!visualizationData.data) return;

      const rate = getRateFromPosition(value, visualizationData.data.chartBars);
      // Convert from decimal to percentage
      const ratePercentage = rate * 100;
      onInterestRateChange(ratePercentage);
    },
    [visualizationData.data, onInterestRateChange]
  );

  // Get risk indicator details
  const riskIndicator = useMemo(() => {
    if (!redemptionRisk.data) return null;

    switch (redemptionRisk.data) {
      case "high": // Note: "high" means high debt in front = LOW risk
        return {
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          icon: CheckCircle,
          label: "Low Redemption Risk",
          description: "Your position is well-protected from redemptions",
        };
      case "medium":
        return {
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          icon: AlertTriangle,
          label: "Medium Redemption Risk",
          description: "Your position has moderate redemption exposure",
        };
      case "low": // Note: "low" means low debt in front = HIGH risk
        return {
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          icon: AlertTriangle,
          label: "High Redemption Risk",
          description: "Your position is at risk of being redeemed",
        };
      default:
        return null;
    }
  }, [redemptionRisk.data]);

  // Handle color for slider based on risk - use shared utility
  const handleColor = useMemo(() => {
    if (!redemptionRisk.data) return undefined;
    return riskLevelToHandleColor(redemptionRisk.data as RiskLevel);
  }, [redemptionRisk.data]);

  return (
    <div className="space-y-3 mt-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-medium text-slate-700">Interest Rate</h3>
          <RedemptionInfo variant="modal" />
        </div>
        <div className="flex items-center gap-2">
          {averageRate.data !== undefined && averageRate.data !== null && (
            <button
              onClick={() => {
                // averageRate.data is already a decimal number from tRPC, convert to percentage
                const avgRatePercentage = averageRate.data * 100;
                onInterestRateChange(avgRatePercentage);
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              disabled={disabled}
            >
              Avg: {(averageRate.data * 100).toFixed(2)}%
            </button>
          )}
          {rebateData && borrowAmount && borrowAmount > 0 ? (
            <>
              <span className="text-sm text-slate-400 line-through">
                {interestRate}% APR
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-green-600">
                  {effectiveRate.toFixed(2)}% APR
                </span>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] text-purple-600 font-medium">
                    (30% STRK rebate)
                  </span>
                  <img
                    src="/starknet.png"
                    alt="STRK"
                    className="w-3 h-3 object-contain"
                  />
                </div>
              </div>
            </>
          ) : (
            <span className="text-sm font-semibold text-blue-600">
              {interestRate}% APR
            </span>
          )}
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-xs text-slate-600 mb-4">
          Set your interest rate. Lower rates improve your position in the
          redemption queue.
        </p>

        {/* Enhanced Interest Rate Slider with Chart */}
        <div className="mb-4">
          {visualizationData.data && visualizationData.data.chartBars.length > 0 ? (
            <>
              <div className="max-w-md">
                <InterestSlider
                  value={sliderValue}
                  onChange={handleSliderChange}
                  chart={chartSizes}
                  riskZones={riskZones}
                  gradientMode="high-to-low"
                  disabled={disabled}
                />
              </div>

              {/* Risk Indicator */}
              {riskIndicator && (
                <div
                  className={`mt-3 p-2 rounded-lg border ${riskIndicator.bgColor} ${riskIndicator.borderColor}`}
                >
                  <div className="flex items-start gap-2">
                    <riskIndicator.icon
                      className={`h-4 w-4 mt-0.5 ${riskIndicator.color}`}
                    />
                    <div className="flex-1">
                      <p
                        className={`text-xs font-medium ${riskIndicator.color}`}
                      >
                        {riskIndicator.label}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {riskIndicator.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Debt Statistics */}
              {visualizationData.data && totalDebt > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-white rounded-lg border border-slate-200 p-2">
                    <p className="text-xs text-slate-500">Debt in front</p>
                    <p className="text-sm font-semibold text-slate-700">
                      <NumericFormat
                        displayType="text"
                        value={debtInFront}
                        thousandSeparator=","
                        decimalScale={0}
                        fixedDecimalScale={false}
                      />{" "}
                      USDU
                    </p>
                  </div>
                  <div className="bg-white rounded-lg border border-slate-200 p-2">
                    <p className="text-xs text-slate-500">Total debt</p>
                    <p className="text-sm font-semibold text-slate-700">
                      <NumericFormat
                        displayType="text"
                        value={totalDebt}
                        thousandSeparator=","
                        decimalScale={0}
                        fixedDecimalScale={false}
                      />{" "}
                      USDU
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Fallback to simple slider when no chart data
            <div className="relative">
              <div className="absolute left-0 top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full w-full bg-slate-200"></div>
                <div
                  className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${((interestRate - 0.5) / 19.5) * 100}%`,
                  }}
                ></div>
              </div>
              <input
                type="range"
                min="0.5"
                max="20"
                step="0.1"
                value={interestRate}
                onChange={(e) =>
                  onInterestRateChange(parseFloat(e.target.value))
                }
                disabled={disabled}
                className="w-full h-2 bg-transparent appearance-none cursor-pointer z-10 relative"
                style={{
                  background: "transparent",
                }}
              />
            </div>
          )}

          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0.5%</span>
            {rebateData && borrowAmount && borrowAmount > 0 && (
              <span className="text-center flex-1">
                <span className="text-purple-600 font-medium">
                  Effective: {effectiveRate.toFixed(2)}%
                </span>
              </span>
            )}
            <span>20%</span>
          </div>
        </div>

        {/* STRK Rebate Information - Now shown below the slider */}
        {borrowAmount && borrowAmount > 0 && (
          <>
            {!rebateData && isLoadingRebate ? (
              // Only show skeleton on initial load when there's no data
              <div className="bg-white rounded-lg p-3 mt-4 border border-slate-200">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                      <Info className="h-3 w-3 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-full mb-3" />

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : rebateData ? (
              <div className="bg-white rounded-lg p-3 mt-4 border border-slate-200">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                      <Info className="h-3 w-3 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-700 mb-1">
                      STRK Rebate Program
                    </h4>
                    <p className="text-xs text-slate-600 mb-3">
                      You get a 30% discount on your interest rate, paid as STRK
                      tokens claimable weekly.
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">
                          Original Annual Interest
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          $
                          <NumericFormat
                            displayType="text"
                            value={rebateData.yearlyInterestUSD}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">
                          Effective Annual Interest
                        </span>
                        <span className="text-xs font-semibold text-green-600">
                          $
                          <NumericFormat
                            displayType="text"
                            value={rebateData.effectiveYearlyInterestUSD}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <span className="text-xs font-medium text-slate-600">
                          Annual Savings (paid in STRK)
                        </span>
                        <span className="text-sm font-bold text-purple-600">
                          $
                          <NumericFormat
                            displayType="text"
                            value={rebateData.yearlyRebateUSD}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />{" "}
                          worth
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
