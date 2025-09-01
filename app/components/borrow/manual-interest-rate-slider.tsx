import { useCallback, useMemo } from "react";
import * as dn from "dnum";
import { InterestRateSlider } from "~/components/ui/interest-rate-slider";
import {
  REDEMPTION_RISK,
  DNUM_0,
  findClosestRateIndex,
  jsonStringifyWithDnum,
  type Dnum,
} from "~/lib/interest-rate-utils";
import type { useInterestRateChartData } from "~/hooks/useInterestRate";

interface ManualInterestRateSliderProps {
  fieldValue: {
    setValue: (value: string) => void;
    value: string;
  };
  handleColor?: number;
  interestChartData: ReturnType<typeof useInterestRateChartData>;
  interestRate: Dnum | null;
}

export function ManualInterestRateSlider({
  fieldValue,
  handleColor,
  interestChartData,
  interestRate,
}: ManualInterestRateSliderProps) {
  // Convert rate (as Dnum/bigint) to slider position (0-1)
  const rateToSliderPosition = useCallback(
    (rate: bigint, chartRates: bigint[]) => {
      if (!rate || !chartRates || chartRates.length === 0) return 0;

      const firstRate = chartRates.at(0) ?? 0n;
      if (rate <= firstRate) return 0;

      const lastRate = chartRates.at(-1) ?? 0n;
      if (rate >= lastRate) return 1;

      return findClosestRateIndex(chartRates, rate) / chartRates.length;
    },
    []
  );

  // Calculate current slider position based on interest rate
  const value = useMemo(() => {
    const rate = interestRate?.[0] ?? 0n;
    const chartRates = interestChartData.data?.map(({ rate }) => {
      // Convert rate from JSON back to Dnum, then get bigint value
      const rateDnum = dn.from(rate, 18);
      return rateDnum[0];
    });
    if (!chartRates) return 0;

    return rateToSliderPosition(rate, chartRates);
  }, [
    jsonStringifyWithDnum(interestChartData.data),
    jsonStringifyWithDnum(interestRate),
    rateToSliderPosition,
  ]);

  // Calculate gradient stops for risk zones
  const gradientStops = useMemo((): [medium: number, low: number] => {
    if (!interestChartData.data || interestChartData.data.length === 0) {
      return [0, 0];
    }

    // Convert all values from JSON to Dnum for calculations
    const chartDataWithDnum = interestChartData.data.map((item) => ({
      ...item,
      rate: dn.from(item.rate, 18),
      debt: dn.from(item.debt, 18),
      debtInFront: dn.from(item.debtInFront, 18),
    }));

    const totalDebt = chartDataWithDnum.reduce(
      (sum, item) => dn.add(sum, item.debt),
      DNUM_0
    );

    if (dn.eq(totalDebt, 0)) {
      return [0, 0];
    }

    // Find exact rates where debt positioning crosses thresholds
    let mediumThresholdRate = null;
    let lowThresholdRate = null;

    for (const [index, item] of chartDataWithDnum.entries()) {
      const prevItem = index > 0 ? chartDataWithDnum[index - 1] : null;
      const prevRate = prevItem?.rate[0] ?? null;

      const debtInFrontRatio = dn.div(item.debtInFront, totalDebt);

      // Place boundary at the rate before crossing threshold (so slider changes at the right position)
      if (
        dn.gt(debtInFrontRatio, REDEMPTION_RISK.medium) &&
        !mediumThresholdRate
      ) {
        mediumThresholdRate = prevRate;
      }

      if (dn.gt(debtInFrontRatio, REDEMPTION_RISK.low) && !lowThresholdRate) {
        lowThresholdRate = prevRate;
        // Low threshold found: no need to continue
        break;
      }
    }

    const chartRates = chartDataWithDnum.map(({ rate }) => rate[0]);
    return [
      mediumThresholdRate
        ? rateToSliderPosition(mediumThresholdRate, chartRates)
        : 0,
      lowThresholdRate
        ? rateToSliderPosition(lowThresholdRate, chartRates)
        : 0,
    ];
  }, [interestChartData.data, rateToSliderPosition]);

  // Check if data is loaded
  const isLoaded = value !== -1 && interestChartData.data;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-12">
        <div className="text-sm text-gray-500">Loading interest rate data...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full pt-4">
      <InterestRateSlider
        gradient={gradientStops}
        gradientMode="high-to-low"
        handleColor={handleColor}
        chart={interestChartData.data?.map(({ size }) => size) ?? []}
        onValueChange={(values) => {
          const newValue = values[0];
          if (interestChartData.data) {
            const index = Math.round(
              newValue * (interestChartData.data.length - 1)
            );
            const rateAtIndex = interestChartData.data[index]?.rate;
            if (rateAtIndex) {
              const rateDnum = dn.from(rateAtIndex, 18);
              // Convert to percentage for the input field
              fieldValue.setValue(String(dn.toNumber(dn.mul(rateDnum, 100))));
            }
          }
        }}
        value={[value]}
        min={0}
        max={1}
        className="w-full"
      />
    </div>
  );
}