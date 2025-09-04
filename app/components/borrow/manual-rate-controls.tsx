import { NumericFormat } from "react-number-format";
import { InterestSlider } from "~/components/borrow/interest-slider";
import { useMemo, useCallback } from "react";
import * as dn from "dnum";
import { findPositionInChart, getRateFromPosition } from "~/lib/interest-rate-visualization";

interface ManualRateControlsProps {
  interestRate: number;
  onInterestRateChange: (rate: number) => void;
  disabled?: boolean;
  visualizationData?: any;
}

export function ManualRateControls({
  interestRate,
  onInterestRateChange,
  disabled = false,
  visualizationData,
}: ManualRateControlsProps) {
  // Convert interest rate to Dnum for calculations
  const interestRateDnum = dn.from(interestRate / 100, 18);

  // Process chart data and calculate debt statistics
  const { chartSizes, riskZones, sliderValue, debtInFront, totalDebt } =
    useMemo(() => {
      if (!visualizationData) {
        return {
          chartSizes: undefined,
          riskZones: { highRiskThreshold: 0.1, mediumRiskThreshold: 0.25 },
          sliderValue: (interestRate - 0.5) / 19.5, // Convert percentage to 0-1 range when no data
          debtInFront: 0,
          totalDebt: 0,
        };
      }

      // Data is already normalized from the server!
      const sizes = visualizationData.chartBars.map(
        (bar: any) => bar.normalized
      );

      // Find current position in the chart
      const currentRateDecimal = dn.toNumber(interestRateDnum); // Convert to decimal
      const sliderPos = findPositionInChart(
        currentRateDecimal,
        visualizationData.chartBars
      );

      // Calculate debt in front based on current interest rate
      // Find the bar that contains our current rate
      const currentBar = visualizationData.chartBars.find(
        (bar: any, index: number) => {
          const nextBar = visualizationData.chartBars[index + 1];
          if (!nextBar) {
            // Last bar - check if rate is >= this bar's rate
            return currentRateDecimal >= bar.rate;
          }
          // Check if rate falls between this bar and next
          return (
            currentRateDecimal >= bar.rate && currentRateDecimal < nextBar.rate
          );
        }
      );

      const debtInFrontValue = currentBar ? currentBar.debtInFront : 0;
      const totalDebtValue = visualizationData.totalDebt;

      return {
        chartSizes: sizes,
        riskZones: visualizationData.riskZones,
        sliderValue: sliderPos,
        debtInFront: debtInFrontValue,
        totalDebt: totalDebtValue,
      };
    }, [visualizationData, interestRateDnum, interestRate]);

  // Handle slider value change - now simpler with clean data
  const handleSliderChange = useCallback(
    (value: number) => {
      if (!visualizationData) {
        // Convert 0-1 back to percentage (0.5-20)
        const rate = 0.5 + value * 19.5;
        onInterestRateChange(rate);
        return;
      }

      const rate = getRateFromPosition(value, visualizationData.chartBars);
      // Convert from decimal to percentage
      const ratePercentage = rate * 100;
      onInterestRateChange(ratePercentage);
    },
    [visualizationData, onInterestRateChange]
  );
  
  // Return the component with the debt data accessible via a separate hook
  return (
    <div className="flex items-center gap-3">
      {/* Input field on the left - now visible on mobile too */}
      <div className="flex items-center gap-1 bg-white rounded-md border border-slate-200 px-3 py-2">
        <NumericFormat
          value={interestRate}
          onValueChange={(values) => {
            const numericValue = values.floatValue;
            if (
              numericValue !== undefined &&
              numericValue >= 0.5 &&
              numericValue <= 20
            ) {
              onInterestRateChange(numericValue);
            }
          }}
          disabled={disabled}
          className="w-20 text-sm font-semibold bg-transparent border-none focus:outline-none text-right p-0"
          placeholder="0.50"
          decimalScale={2}
          fixedDecimalScale={true}
          allowNegative={false}
          thousandSeparator={false}
          isAllowed={(values) => {
            const { floatValue } = values;
            return (
              floatValue === undefined ||
              (floatValue >= 0.5 && floatValue <= 20)
            );
          }}
        />
        <span className="text-sm font-semibold text-slate-600">
          %
        </span>
      </div>

      <div className="flex-1 max-w-md">
        <InterestSlider
          value={sliderValue}
          onChange={handleSliderChange}
          chart={chartSizes}
          riskZones={riskZones}
          gradientMode="high-to-low"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

// Export just the data extraction if needed
export function useManualRateData(visualizationData: any, interestRate: number) {
  const interestRateDnum = dn.from(interestRate / 100, 18);
  
  if (!visualizationData) {
    return { debtInFront: 0, totalDebt: 0 };
  }

  const currentRateDecimal = dn.toNumber(interestRateDnum);
  const currentBar = visualizationData.chartBars?.find(
    (bar: any, index: number) => {
      const nextBar = visualizationData.chartBars[index + 1];
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
    totalDebt: visualizationData.totalDebt || 0,
  };
}
