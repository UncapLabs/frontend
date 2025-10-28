import { NumericFormat } from "react-number-format";
import { InterestSlider } from "~/components/borrow/interest-slider";
import { useMemo, useCallback } from "react";
import * as dn from "dnum";
import { findPositionInChart } from "~/lib/interest-rate-visualization";
import Big from "big.js";

interface ManualRateControlsProps {
  interestRate: number;
  onInterestRateChange: (rate: number) => void;
  borrowAmount?: Big;
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
      // Mimic the non-linear distribution used by the server:
      // - 0.1% increments from 0.5% to 5% (45 bars)
      // - 0.5% increments from 5% to 20% (30 bars)
      // Total: 75 bars

      const rate = interestRate;
      let barIndex: number;

      if (rate <= 0.5) {
        barIndex = 0;
      } else if (rate < 5) {
        // Precision range: 0.5% to 5%
        barIndex = Math.floor((rate - 0.5) / 0.1);
      } else if (rate <= 20) {
        // Normal range: 5% to 20%
        const barsInPreciseRange = 45; // (5 - 0.5) / 0.1 = 45
        barIndex = barsInPreciseRange + Math.floor((rate - 5) / 0.5);
      } else {
        barIndex = 74; // Max index (75 bars total, 0-indexed)
      }

      const totalBars = 75;
      const sliderValue = barIndex / (totalBars - 1);

      return {
        chartSizes: undefined,
        riskZones: { highRiskThreshold: 0.1, mediumRiskThreshold: 0.25 },
        sliderValue,
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
        // Convert slider position back to interest rate using non-linear distribution
        const totalBars = 75;
        const barIndex = Math.round(value * (totalBars - 1));
        const barsInPreciseRange = 45;

        let rateBig: Big;
        if (barIndex < barsInPreciseRange) {
          // Precision range: 0.5% to 5%
          rateBig = new Big("0.5").plus(
            new Big(barIndex).times("0.1")
          );
        } else {
          // Normal range: 5% to 20%
          const normalBarIndex = barIndex - barsInPreciseRange;
          rateBig = new Big("5").plus(
            new Big(normalBarIndex).times("0.5")
          );
        }

        onInterestRateChange(Number(rateBig.toFixed(2)));
        return;
      }

      const chartBars = visualizationData.chartBars;
      const totalBars = chartBars.length;
      const barIndex = Math.round(value * (totalBars - 1));
      const clampedIndex = Math.max(0, Math.min(totalBars - 1, barIndex));
      const selectedBar = chartBars[clampedIndex];

      const ratePercentage = new Big(selectedBar.rate)
        .times(100)
        .toFixed(2);

      onInterestRateChange(Number(ratePercentage));
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
          inputMode="decimal"
          decimalScale={2}
          decimalSeparator="."
          allowedDecimalSeparators={[",", "."]}
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
        {borrowAmount && borrowAmount.gt(0) && (
          <div className="flex items-baseline">
            <span className="text-sm text-neutral-800 font-medium font-sora">
              {borrowAmount.times(interestRate).div(100).toFixed(2)}
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
