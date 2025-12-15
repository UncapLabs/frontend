import * as z from "zod";
import { RpcProvider } from "starknet";
import { publicProcedure, router } from "../trpc";
import {
  INTEREST_RATE_START_BIG,
  INTEREST_RATE_END_BIG,
  INTEREST_RATE_PRECISE_UNTIL_BIG,
  INTEREST_RATE_INCREMENT_PRECISE_BIG,
  INTEREST_RATE_INCREMENT_NORMAL_BIG,
} from "~/lib/interest-rate-utils";
import {
  fetchAllInterestRateBrackets,
  getAverageInterestRateForBranch,
  getAllBranchesStats,
} from "../services/interest";
import Big from "big.js";
import { fetchTelosBatchMetadata } from "../services/telos-batch";
import { getCollateralByBranchId } from "~/lib/collateral";

type ChartDataPoint = {
  debt: Big;
  debtInFront: Big;
  rate: Big;
  size: number;
};

// Calculate risk zone thresholds based on debt distribution
function calculateRiskZones(chartData: ChartDataPoint[]): {
  highRiskThreshold: number;
  mediumRiskThreshold: number;
} {
  if (chartData.length === 0) {
    return { highRiskThreshold: 0.1, mediumRiskThreshold: 0.25 };
  }

  // Calculate total debt - properly parse the JSON Dnum format
  const totalDebt = chartData.reduce(
    (sum, item) => sum.plus(item.debt),
    new Big(0)
  );

  if (totalDebt.eq(0)) {
    return { highRiskThreshold: 0.1, mediumRiskThreshold: 0.25 };
  }

  let highRiskThreshold = 0.1;
  let mediumRiskThreshold = 0.25;
  let foundHighRisk = false;
  let foundMediumRisk = false;

  // Find positions where risk changes
  // We're looking for the position where cumulative debt crosses 10% and 25%
  for (let i = 0; i < chartData.length; i++) {
    const item = chartData[i];
    const ratio = item.debtInFront.div(totalDebt).toNumber();
    // Use the center of the bar for more accurate positioning
    const position = (i + 0.5) / Math.max(1, chartData.length);

    // Find where 10% of debt is in front (transition from high to medium risk)
    // Positions with < 10% debt in front = HIGH risk
    if (ratio >= 0.1 && !foundHighRisk) {
      highRiskThreshold = position;
      foundHighRisk = true;
    }

    // Find where 25% of debt is in front (transition from medium to low risk)
    // Positions with < 25% debt in front = MEDIUM risk
    if (ratio >= 0.25 && !foundMediumRisk) {
      mediumRiskThreshold = position;
      foundMediumRisk = true;
      break; // We found both thresholds
    }
  }

  return { highRiskThreshold, mediumRiskThreshold };
}

// Calculate chart data for a given branch and optional excluded loan
async function calculateChartData(
  branchId: number,
  excludedLoan?: {
    id: string;
    interestRate: string;
    recordedDebt: string;
    updatedAt: number;
  }
): Promise<ChartDataPoint[]> {
  const data = await fetchAllInterestRateBrackets();

  const filteredBrackets = data.brackets.filter(
    (bracket) => bracket.branchId === branchId
  );

  // Calculate effective timestamp
  const now = Date.now();
  const lastUpdatedMs = Number(data.lastUpdatedAt) * 1000;
  const timestamp = BigInt(
    Math.floor(
      Math.max(
        now,
        lastUpdatedMs,
        ...(excludedLoan ? [excludedLoan.updatedAt] : [])
      ) / 1000
    )
  );

  const debtByRate = new Map<string, Big>();

  for (const bracket of filteredBrackets) {
    const rate = bracket.rate;

    if (rate.gte(INTEREST_RATE_START_BIG) && rate.lte(INTEREST_RATE_END_BIG)) {
      // Calculate totalDebt with pending interest
      const effectiveTimestamp =
        timestamp < data.lastUpdatedAt ? data.lastUpdatedAt : timestamp;

      const totalDebt = bracket.totalDebt;
      const updatedAt = bracket.updatedAt;

      const timeDelta = new Big((effectiveTimestamp - updatedAt).toString());
      const oneYearSeconds = new Big(365 * 24 * 60 * 60);

      const pendingDebt = bracket.pendingDebtTimesOneYearD36
        .plus(bracket.sumDebtTimesRateD36.times(timeDelta))
        .div(oneYearSeconds);

      const totalWithPending = totalDebt.plus(pendingDebt);
      debtByRate.set(rate.toString(), totalWithPending);
    }
  }

  const chartData: ChartDataPoint[] = [];
  let currentRate = INTEREST_RATE_START_BIG;
  let debtInFront = new Big(0);
  let highestDebt = new Big(0);

  while (currentRate.lte(INTEREST_RATE_END_BIG)) {
    const nextRate = currentRate.plus(
      currentRate.lt(INTEREST_RATE_PRECISE_UNTIL_BIG)
        ? INTEREST_RATE_INCREMENT_PRECISE_BIG
        : INTEREST_RATE_INCREMENT_NORMAL_BIG
    );

    let aggregatedDebt = new Big(0);

    for (const [rateKey, debt] of debtByRate.entries()) {
      const rate = new Big(rateKey);
      if (rate.gte(currentRate) && rate.lt(nextRate)) {
        aggregatedDebt = aggregatedDebt.plus(debt);
      }
    }

    // Exclude user's own debt from calculation
    if (excludedLoan) {
      const loanRate = new Big(excludedLoan.interestRate).div(1e18);
      if (loanRate.gte(currentRate) && loanRate.lt(nextRate)) {
        const loanUpdatedAt = BigInt(excludedLoan.updatedAt / 1000);
        const recordedDebt = new Big(excludedLoan.recordedDebt).div(1e18);

        // Calculate pending debt: pendingInterest = debt * rate * timeDelta / ONE_YEAR
        const timeDelta = new Big((timestamp - loanUpdatedAt).toString());
        const oneYearSeconds = new Big(365 * 24 * 60 * 60);
        const pendingInterest = recordedDebt
          .times(loanRate)
          .times(timeDelta)
          .div(oneYearSeconds);

        const excludedDebt = recordedDebt.plus(pendingInterest);
        aggregatedDebt = aggregatedDebt.minus(excludedDebt);
      }
    }

    chartData.push({
      debt: aggregatedDebt,
      debtInFront: debtInFront,
      rate: currentRate,
      size: aggregatedDebt.toNumber(),
    });

    debtInFront = debtInFront.plus(aggregatedDebt);
    currentRate = nextRate;
    if (aggregatedDebt.gt(highestDebt)) {
      highestDebt = aggregatedDebt;
    }
  }

  // Normalize sizes between 0 and 1
  if (highestDebt.gt(0)) {
    for (const datum of chartData) {
      datum.size = datum.debt.div(highestDebt).toNumber();
    }
  }

  return chartData;
}

export const interestRouter = router({
  getInterestRateChartData: publicProcedure
    .input(
      z.object({
        branchId: z.number().optional().default(0),
        excludedLoan: z
          .object({
            id: z.string(),
            interestRate: z.string(),
            recordedDebt: z.string(),
            updatedAt: z.number(),
          })
          .optional(),
      })
    )
    .query(async ({ input }) => {
      // Use the shared function to calculate chart data
      return calculateChartData(input.branchId, input.excludedLoan);
    }),
  // Enhanced endpoint that returns clean, pre-processed visualization data
  getInterestRateVisualizationData: publicProcedure
    .input(
      z.object({
        branchId: z.number().optional().default(0),
        excludedLoan: z
          .object({
            id: z.string(),
            interestRate: z.string(),
            recordedDebt: z.string(),
            updatedAt: z.number(),
          })
          .optional(),
      })
    )
    .query(async ({ input }) => {
      const chartData = await calculateChartData(
        input.branchId,
        input.excludedLoan
      );

      // Calculate risk zones
      const riskZones = calculateRiskZones(chartData);

      const chartBars = chartData.map((point) => ({
        rate: point.rate,
        debt: point.debt,
        debtInFront: point.debtInFront,
        normalized: point.size,
      }));

      const totalDebt = chartBars.reduce(
        (sum, bar) => sum.plus(bar.debt),
        new Big(0)
      );

      return {
        chartBars,
        riskZones,
        totalDebt,
        // Return the chart length for position calculations
        chartLength: chartBars.length,
      };
    }),
  getAverageInterestRate: publicProcedure
    .input(
      z.object({
        branchId: z.number().optional().default(0),
      })
    )
    .query(async ({ input }) => {
      return getAverageInterestRateForBranch(input.branchId);
    }),
  getAllBranchesStats: publicProcedure.query(async () => {
    return getAllBranchesStats();
  }),
  getTelosBatchMetadata: publicProcedure
    .input(
      z.object({
        branchId: z.number().optional().default(0),
        batchManagerAddress: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const collateral = getCollateralByBranchId(input.branchId);

      if (!collateral) {
        throw new Error(`Unsupported branch id: ${input.branchId}`);
      }

      const provider = new RpcProvider({ nodeUrl: ctx.env.NODE_URL });

      const metadata = await fetchTelosBatchMetadata(
        provider,
        collateral.id,
        input.batchManagerAddress
      );

      const cooldownEndsAt =
        metadata.lastInterestRateAdjustment +
        metadata.minInterestRateChangePeriodSeconds;
      const nowSeconds = Math.floor(Date.now() / 1000);
      const isInCooldown = cooldownEndsAt > nowSeconds;

      return {
        collateralId: metadata.collateralId,
        batchManagerAddress: metadata.batchManagerAddress,
        annualInterestRate: metadata.annualInterestRate,
        minInterestRate: metadata.minInterestRate,
        maxInterestRate: metadata.maxInterestRate,
        annualManagementFee: metadata.annualManagementFee,
        minInterestRateChangePeriodSeconds:
          metadata.minInterestRateChangePeriodSeconds,
        lastInterestRateAdjustment: metadata.lastInterestRateAdjustment,
        lastDebtUpdateTime: metadata.lastDebtUpdateTime,
        cooldownEndsAt,
        isInCooldown,
        bcrRequirement: metadata.bcrRequirement,
        managedDebt: metadata.managedDebt,
      };
    }),
});

export type InterestRouter = typeof interestRouter;
