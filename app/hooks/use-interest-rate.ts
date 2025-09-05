import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import * as dn from "dnum";
import {
  INTEREST_RATE_PRECISE_UNTIL,
  INTEREST_RATE_INCREMENT_PRECISE,
  INTEREST_RATE_INCREMENT_NORMAL,
  ONE_YEAR_D18,
  DNUM_0,
  dnum18,
  type Dnum,
} from "~/lib/interest-rate-utils";

// Types matching our loan structure
type PositionLoanCommitted = {
  id: string;
  branchId?: number;
  interestRate: Dnum;
  recordedDebt: Dnum;
  updatedAt: number; // timestamp in ms
};

// Direct wrapper for getAllInterestRateBrackets
function useAllInterestRateBrackets() {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.interestRouter.getAllInterestRateBrackets.queryOptions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });
}

// Get brackets for specific branch
export function useInterestRateBrackets(branchId: number = 0) {
  const trpc = useTRPC();
  const { status, data } = useQuery({
    ...trpc.interestRouter.getInterestRateBrackets.queryOptions({ branchId }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });

  return useMemo(() => {
    if (!data) return { status, data: undefined };

    // Process brackets with totalDebt function exactly like Liquity
    const brackets = data.brackets.map((bracket: any) => ({
      // bracket.rate is already a JSON string from tRPC, parse it properly
      rate: typeof bracket.rate === 'string' && bracket.rate.startsWith('[') 
        ? dn.from(JSON.parse(bracket.rate)[0], 18)
        : dn.from(bracket.rate, 18),
      // Create a totalDebt function that calculates current debt with pending interest
      totalDebt: (timestamp: bigint) => {
        const ts = timestamp;
        const updatedAt = BigInt(bracket.updatedAt || "0");
        const lastUpdated = BigInt(data.lastUpdatedAt);

        // Use max of timestamp and lastUpdatedAt (like Liquity)
        const effectiveTimestamp = ts < lastUpdated ? lastUpdated : ts;

        const totalDebt = BigInt(bracket.totalDebt);
        
        // Liquity's exact calculation:
        // pendingDebt = (pendingDebtTimesOneYearD36 + sumDebtTimesRateD36 * timeDelta) / ONE_YEAR
        const pendingDebt =
          (BigInt(bracket.pendingDebtTimesOneYearD36 || "0") +
            BigInt(bracket.sumDebtTimesRateD36 || "0") *
              (effectiveTimestamp - updatedAt)) /
          ONE_YEAR_D18;

        return dnum18(totalDebt + pendingDebt);
      },
    }));

    return {
      status,
      data: {
        lastUpdatedAt: BigInt(data.lastUpdatedAt),
        brackets,
      },
    };
  }, [branchId, status, data]);
}

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
            interestRate: dn.toJSON(excludedLoan.interestRate),
            recordedDebt: dn.toJSON(excludedLoan.recordedDebt),
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
            interestRate: dn.toJSON(excludedLoan.interestRate),
            recordedDebt: dn.toJSON(excludedLoan.recordedDebt),
            updatedAt: excludedLoan.updatedAt,
          }
        : undefined,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });
}

// Calculate debt in front of interest rate
export function useDebtInFrontOfInterestRate(
  branchId: number,
  interestRate: Dnum | null,
  loan?: PositionLoanCommitted
) {
  const chartData = useInterestRateChartData(branchId, loan);

  return useMemo(() => {
    if (!chartData.data || !interestRate) return { data: null };

    // Find the bracket containing this rate
    const bracket = chartData.data.find((b: any) => {
      // b.rate is a JSON string like '["5000000000000000",18]', parse it properly
      let bRate: Dnum;
      if (typeof b.rate === 'string') {
        const parsed = JSON.parse(b.rate);
        // Convert the first element to bigint if it's not already
        bRate = [BigInt(parsed[0]), parsed[1]] as Dnum;
      } else {
        bRate = b.rate;
      }
      
      const increment = dn.lt(bRate, INTEREST_RATE_PRECISE_UNTIL)
        ? INTEREST_RATE_INCREMENT_PRECISE
        : INTEREST_RATE_INCREMENT_NORMAL;

      return (
        dn.gte(interestRate, bRate) &&
        dn.lt(interestRate, dn.add(bRate, increment))
      );
    });

    const totalDebt = chartData.data.reduce(
      (sum: Dnum, b: any) => {
        // b.debt is a JSON string like '["0",18]', parse it properly
        let debt: Dnum;
        if (typeof b.debt === 'string') {
          const parsed = JSON.parse(b.debt);
          // Convert the first element to bigint if it's not already
          debt = [BigInt(parsed[0]), parsed[1]] as Dnum;
        } else {
          debt = b.debt;
        }
        return dn.add(sum, debt);
      },
      DNUM_0
    );

    return {
      data: {
        debtInFront: bracket 
          ? (() => {
              if (typeof bracket.debtInFront === 'string') {
                const parsed = JSON.parse(bracket.debtInFront);
                return [BigInt(parsed[0]), parsed[1]] as Dnum;
              }
              return bracket.debtInFront;
            })()
          : DNUM_0,
        totalDebt,
      },
    };
  }, [chartData.data, interestRate]);
}

// Get redemption risk
export function useRedemptionRiskOfInterestRate(
  branchId: number,
  interestRate: Dnum | null,
  loan?: PositionLoanCommitted
) {
  const debtInFront = useDebtInFrontOfInterestRate(
    branchId,
    interestRate,
    loan
  );

  return useMemo(() => {
    if (!debtInFront.data) return { data: null };

    const totalDebt = dn.toNumber(debtInFront.data.totalDebt);
    
    // Avoid division by zero - if no debt exists, risk is low
    if (totalDebt === 0) {
      return { data: "Low" };
    }

    const ratio = dn.toNumber(debtInFront.data.debtInFront) / totalDebt;

    // IMPORTANT: Lower debt in front = HIGHER risk (you're more likely to be redeemed)
    // Higher debt in front = LOWER risk (many others would be redeemed before you)
    return {
      data: ratio < 0.10 ? "High" : ratio < 0.25 ? "Medium" : "Low",
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
