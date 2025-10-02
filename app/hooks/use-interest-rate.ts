import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import {
  INTEREST_RATE_PRECISE_UNTIL_BIG,
  INTEREST_RATE_INCREMENT_PRECISE_BIG,
  INTEREST_RATE_INCREMENT_NORMAL_BIG,
} from "~/lib/interest-rate-utils";
import Big from "big.js";

type PositionLoanCommitted = {
  id: string;
  branchId?: number;
  interestRate: Big;
  recordedDebt: Big;
  updatedAt: number;
};

// Get chart data (calls tRPC which has our calculation logic)
export function useInterestRateChartData(
  branchId: number = 0,
  excludedLoan?: PositionLoanCommitted
) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.interestRouter.getInterestRateChartData.queryOptions({
      branchId,
      excludedLoan: excludedLoan
        ? {
            id: excludedLoan.id,
            interestRate: excludedLoan.interestRate.times(1e18).toFixed(0),
            recordedDebt: excludedLoan.recordedDebt.times(1e18).toFixed(0),
            updatedAt: excludedLoan.updatedAt,
          }
        : undefined,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });
}

// Enhanced hook that returns clean, pre-processed visualization data
export function useInterestRateVisualizationData(
  branchId: number = 0,
  excludedLoan?: PositionLoanCommitted
) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.interestRouter.getInterestRateVisualizationData.queryOptions({
      branchId,
      excludedLoan: excludedLoan
        ? {
            id: excludedLoan.id,
            interestRate: excludedLoan.interestRate.times(1e18).toFixed(0),
            recordedDebt: excludedLoan.recordedDebt.times(1e18).toFixed(0),
            updatedAt: excludedLoan.updatedAt,
          }
        : undefined,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // 2 minutes
  });
}

// Calculate debt in front of interest rate
export function useDebtInFrontOfInterestRate(
  branchId: number,
  interestRate: Big | null,
  loan?: PositionLoanCommitted
) {
  const chartData = useInterestRateChartData(branchId, loan);

  return useMemo(() => {
    if (!chartData.data || !interestRate) return { data: null };

    // Find the bracket containing this rate
    const bracket = chartData.data.find((b: any) => {
      const bRate = b.rate;
      const increment = bRate.lt(INTEREST_RATE_PRECISE_UNTIL_BIG)
        ? INTEREST_RATE_INCREMENT_PRECISE_BIG
        : INTEREST_RATE_INCREMENT_NORMAL_BIG;

      return interestRate.gte(bRate) && interestRate.lt(bRate.plus(increment));
    });

    const totalDebt = chartData.data.reduce(
      (sum: Big, b: any) => sum.plus(b.debt),
      new Big(0)
    );

    return {
      data: {
        debtInFront: bracket ? bracket.debtInFront : new Big(0),
        totalDebt,
      },
    };
  }, [chartData.data, interestRate]);
}

// Get redemption risk
export function useRedemptionRiskOfInterestRate(
  branchId: number,
  interestRate: Big | null,
  loan?: PositionLoanCommitted
) {
  const debtInFront = useDebtInFrontOfInterestRate(
    branchId,
    interestRate,
    loan
  );

  return useMemo(() => {
    if (!debtInFront.data) return { data: null };

    const totalDebt = debtInFront.data.totalDebt;

    // Avoid division by zero - if no debt exists, risk is low
    if (totalDebt.eq(0)) {
      return { data: "Low" };
    }

    const ratio = debtInFront.data.debtInFront.div(totalDebt).toNumber();

    // IMPORTANT: Lower debt in front = HIGHER risk (you're more likely to be redeemed)
    // Higher debt in front = LOWER risk (many others would be redeemed before you)
    return {
      data: ratio < 0.1 ? "High" : ratio < 0.25 ? "Medium" : "Low",
    };
  }, [debtInFront.data]);
}

// Get average interest rate
export function useAverageInterestRate(branchId: number = 0) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.interestRouter.getAverageInterestRate.queryOptions({ branchId }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
