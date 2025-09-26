import { NumericFormat } from "react-number-format";
import { InterestSlider } from "~/components/borrow/interest-slider";
import { useMemo, useCallback } from "react";
import * as dn from "dnum";
import {
  findPositionInChart,
  getRateFromPosition,
} from "~/lib/interest-rate-visualization";

interface ManualRateControlsProps {
  interestRate: number;
  onInterestRateChange: (rate: number) => void;
  borrowAmount?: number;
  disabled?: boolean;
  visualizationData?: any;
}

export function ManualRateControls({
  interestRate,
  onInterestRateChange,
  borrowAmount,
  disabled = false,
  visualizationData,
}: ManualRateControlsProps) {
  // Convert interest rate to Dnum for calculations
  const interestRateDnum = dn.from(interestRate / 100, 18);

  // Process chart data and calculate debt statistics
  const { chartSizes, riskZones, sliderValue } = useMemo(() => {
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
    const sizes = visualizationData.chartBars.map((bar: any) => bar.normalized);

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

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-baseline gap-3">
        <NumericFormat
          value={interestRate}
          onValueChange={(values) => {
            const numericValue = values.floatValue;
            if (numericValue !== undefined) {
              // Allow all values during typing, let isAllowed handle the validation
              onInterestRateChange(numericValue);
            }
          }}
          disabled={disabled}
          style={{ width: `${(interestRate.toFixed(2).length + 1) * 0.65}em` }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal font-sora leading-10 text-neutral-800 bg-transparent border-none focus:outline-none text-left p-0"
          placeholder="0.50"
          decimalScale={2}
          fixedDecimalScale={true}
          allowNegative={false}
          suffix={"%"}
          thousandSeparator={false}
          isAllowed={(values) => {
            const { floatValue } = values;
            // Only check maximum, not minimum
            return floatValue === undefined || floatValue <= 20;
          }}
          onBlur={() => {
            if (interestRate < 0.5) {
              onInterestRateChange(0.5);
            }
          }}
        />
        {/* Yearly Interest Cost - Display on the right */}
        {borrowAmount && borrowAmount > 0 && (
          <div className="flex items-baseline">
            <span className="text-sm text-neutral-800 font-medium font-sora">
              {((borrowAmount * interestRate) / 100).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs text-neutral-500 block ml-1">
              {" "}
              USDU / year
            </span>
          </div>
        )}
      </div>

      <div className="w-full">
        <InterestSlider
          value={sliderValue}
          onChange={handleSliderChange}
          chart={chartSizes}
          riskZones={riskZones}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
