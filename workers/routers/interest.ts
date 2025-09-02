import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { createGraphQLClient } from "~/lib/graphql/client";
import { ALL_INTEREST_RATE_BRACKETS } from "~/lib/graphql/documents";
import * as dn from "dnum";
import {
  INTEREST_RATE_START,
  INTEREST_RATE_END,
  INTEREST_RATE_PRECISE_UNTIL,
  INTEREST_RATE_INCREMENT_PRECISE,
  INTEREST_RATE_INCREMENT_NORMAL,
  ONE_YEAR_D18,
  DNUM_0,
  dnum18,
  calculatePendingInterest,
  type Dnum,
} from "~/lib/interest-rate-utils";

// Type definitions
type InterestRateBracket = {
  branchId: number;
  rate: Dnum;
  totalDebt: bigint;
  sumDebtTimesRateD36: bigint;
  pendingDebtTimesOneYearD36: bigint;
  updatedAt: bigint;
};

type ChartDataPoint = {
  debt: string;
  debtInFront: string;
  rate: string;
  size: number;
};

// Fetch all interest rate brackets
async function fetchAllInterestRateBrackets(): Promise<{
  lastUpdatedAt: bigint;
  brackets: InterestRateBracket[];
}> {
  const graphqlEndpoint =
    process.env.GRAPHQL_ENDPOINT || "http://localhost:3000/graphql";
  const graphqlClient = createGraphQLClient(graphqlEndpoint);

  const result = await graphqlClient.request(ALL_INTEREST_RATE_BRACKETS);

  if (!result.interestratebrackets) {
    return {
      lastUpdatedAt: 0n,
      brackets: [],
    };
  }

  const brackets: InterestRateBracket[] = result.interestratebrackets
    .map((bracket) => ({
      branchId: bracket.collateral.collIndex,
      rate: [BigInt(bracket.rate), 18] as Dnum,
      totalDebt: BigInt(bracket.totalDebt),
      sumDebtTimesRateD36: BigInt(bracket.sumDebtTimesRateD36 || "0"),
      pendingDebtTimesOneYearD36: BigInt(
        bracket.pendingDebtTimesOneYearD36 || "0"
      ),
      updatedAt: BigInt(bracket.updatedAt || "0"),
    }))
    .sort((a: InterestRateBracket, b: InterestRateBracket) =>
      dn.compare(a.rate, b.rate)
    );

  // Find the latest update timestamp
  const lastUpdatedAt =
    brackets.length > 0
      ? brackets
          .map((bracket: InterestRateBracket) => bracket.updatedAt)
          .reduce((a: bigint, b: bigint) => (a > b ? a : b), 0n)
      : 0n;

  return {
    lastUpdatedAt,
    brackets,
  };
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
    (bracket: InterestRateBracket) => bracket.branchId === branchId
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

  const debtByRate = new Map<string, Dnum>();

  for (const bracket of filteredBrackets) {
    const rate = bracket.rate;

    if (dn.gte(rate, INTEREST_RATE_START) && dn.lte(rate, INTEREST_RATE_END)) {
      // Calculate totalDebt with pending interest
      const effectiveTimestamp =
        timestamp < data.lastUpdatedAt ? data.lastUpdatedAt : timestamp;

      const totalDebt = bracket.totalDebt;
      const updatedAt = bracket.updatedAt;

      const ONE_YEAR_D36 = ONE_YEAR_D18 * 10n ** 18n;
      const pendingDebt =
        (bracket.pendingDebtTimesOneYearD36 +
          bracket.sumDebtTimesRateD36 * (effectiveTimestamp - updatedAt)) /
        ONE_YEAR_D36;

      const totalWithPending: Dnum = [totalDebt + pendingDebt, 18];
      debtByRate.set(dn.toJSON(rate), totalWithPending);
    }
  }

  const chartData: ChartDataPoint[] = [];
  let currentRate = INTEREST_RATE_START;
  let debtInFront = DNUM_0;
  let highestDebt = DNUM_0;

  while (dn.lte(currentRate, INTEREST_RATE_END)) {
    const nextRate = dn.add(
      currentRate,
      dn.lt(currentRate, INTEREST_RATE_PRECISE_UNTIL)
        ? INTEREST_RATE_INCREMENT_PRECISE
        : INTEREST_RATE_INCREMENT_NORMAL
    );

    let aggregatedDebt = DNUM_0;

    for (const [rateKey, debt] of debtByRate.entries()) {
      const rateData = JSON.parse(rateKey);
      const rate: Dnum = [BigInt(rateData[0]), rateData[1]];
      if (dn.gte(rate, currentRate) && dn.lt(rate, nextRate)) {
        aggregatedDebt = dn.add(aggregatedDebt, debt);
      }
    }

    // Exclude user's own debt from calculation
    if (excludedLoan) {
      const loanRate = dn.from(excludedLoan.interestRate, 18);
      if (dn.gte(loanRate, currentRate) && dn.lt(loanRate, nextRate)) {
        const loanUpdatedAt = BigInt(excludedLoan.updatedAt / 1000);
        const recordedDebt = dn.from(excludedLoan.recordedDebt, 18);

        // Calculate pending debt: pendingInterest = debt * rate * timeDelta / ONE_YEAR
        const pendingInterest = calculatePendingInterest(
          recordedDebt[0],
          loanRate,
          timestamp - loanUpdatedAt
        );
        const pendingDebt = dnum18(pendingInterest);

        const excludedDebt = dn.add(recordedDebt, pendingDebt);
        aggregatedDebt = dn.sub(aggregatedDebt, excludedDebt);
      }
    }

    chartData.push({
      debt: dn.toJSON(aggregatedDebt),
      debtInFront: dn.toJSON(debtInFront),
      rate: dn.toJSON(currentRate),
      size: dn.toNumber(aggregatedDebt),
    });

    debtInFront = dn.add(debtInFront, aggregatedDebt);
    currentRate = nextRate;
    if (dn.gt(aggregatedDebt, highestDebt)) {
      highestDebt = aggregatedDebt;
    }
  }

  // Normalize sizes between 0 and 1
  if (highestDebt[0] !== 0n) {
    const divisor = dn.toNumber(highestDebt);
    for (const datum of chartData) {
      datum.size /= divisor;
    }
  }

  return chartData;
}

export const interestRouter = router({
  getAllInterestRateBrackets: publicProcedure.query(async () => {
    try {
      const data = await fetchAllInterestRateBrackets();

      return {
        lastUpdatedAt: data.lastUpdatedAt.toString(),
        brackets: data.brackets.map((bracket) => ({
          branchId: bracket.branchId,
          rate: dn.toJSON(bracket.rate),
          totalDebt: bracket.totalDebt.toString(),
          sumDebtTimesRateD36: bracket.sumDebtTimesRateD36.toString(),
          pendingDebtTimesOneYearD36:
            bracket.pendingDebtTimesOneYearD36.toString(),
          updatedAt: bracket.updatedAt.toString(),
        })),
      };
    } catch (error) {
      console.error("Error fetching interest rate brackets:", error);
      throw new Error("Failed to fetch interest rate brackets");
    }
  }),
  getInterestRateBrackets: publicProcedure
    .input(
      z.object({
        branchId: z.number().optional().default(0),
      })
    )
    .query(async ({ input }) => {
      const data = await fetchAllInterestRateBrackets();

      const filteredBrackets = data.brackets.filter(
        (bracket: InterestRateBracket) => bracket.branchId === input.branchId
      );

      return {
        lastUpdatedAt: data.lastUpdatedAt.toString(),
        brackets: filteredBrackets.map((bracket) => ({
          branchId: bracket.branchId,
          rate: dn.toJSON(bracket.rate),
          // Return the raw data needed for totalDebt calculation
          totalDebt: bracket.totalDebt.toString(),
          pendingDebtTimesOneYearD36:
            bracket.pendingDebtTimesOneYearD36.toString(),
          sumDebtTimesRateD36: bracket.sumDebtTimesRateD36.toString(),
          updatedAt: bracket.updatedAt.toString(),
        })),
      };
    }),
  calculateTotalDebt: publicProcedure
    .input(
      z.object({
        bracket: z.object({
          totalDebt: z.string(),
          pendingDebtTimesOneYearD36: z.string(),
          sumDebtTimesRateD36: z.string(),
          updatedAt: z.string(),
        }),
        timestamp: z.string(),
        lastUpdatedAt: z.string(),
      })
    )
    .query(async ({ input }) => {
      const ts = BigInt(input.timestamp);
      const updatedAt = BigInt(input.bracket.updatedAt);
      const lastUpdated = BigInt(input.lastUpdatedAt);

      // Use max of timestamp and lastUpdatedAt (like Liquity)
      const effectiveTimestamp = ts < lastUpdated ? lastUpdated : ts;

      const totalDebt = BigInt(input.bracket.totalDebt);
      const ONE_YEAR_D36 = ONE_YEAR_D18 * 10n ** 18n; // ONE_YEAR in 36 decimal format
      const pendingDebt =
        (BigInt(input.bracket.pendingDebtTimesOneYearD36) +
          BigInt(input.bracket.sumDebtTimesRateD36) *
            (effectiveTimestamp - updatedAt)) /
        ONE_YEAR_D36;

      return dn.toJSON(dnum18(totalDebt + pendingDebt));
    }),
  getInterestRateChartData: publicProcedure
    .input(
      z.object({
        branchId: z.number().optional().default(0),
        excludedLoan: z
          .object({
            id: z.string(),
            interestRate: z.string(), // Dnum as JSON
            recordedDebt: z.string(), // Dnum as JSON
            updatedAt: z.number(), // timestamp in ms
          })
          .optional(),
      })
    )
    .query(async ({ input }) => {
      // Use the shared function to calculate chart data
      return calculateChartData(input.branchId, input.excludedLoan);
    }),
  getDebtInFront: publicProcedure
    .input(
      z.object({
        branchId: z.number().optional().default(0),
        interestRate: z.string(), // Dnum as JSON
        excludedLoan: z
          .object({
            id: z.string(),
            interestRate: z.string(), // Dnum as JSON
            recordedDebt: z.string(), // Dnum as JSON
            updatedAt: z.number(), // timestamp in ms
          })
          .optional(),
      })
    )
    .query(
      async ({
        input,
      }): Promise<{ debtInFront: string; totalDebt: string }> => {
        // Use the shared function to get chart data
        const chartData = await calculateChartData(
          input.branchId,
          input.excludedLoan
        );

        const targetRate = dn.from(input.interestRate, 18);

        let debtInFront = DNUM_0;
        let found = false;

        for (const bracket of chartData) {
          // Parse the rate from JSON string
          const bracketRate =
            typeof bracket.rate === "string"
              ? dn.from(JSON.parse(bracket.rate)[0], 18)
              : dn.from(bracket.rate, 18);

          const increment = dn.lt(bracketRate, INTEREST_RATE_PRECISE_UNTIL)
            ? INTEREST_RATE_INCREMENT_PRECISE
            : INTEREST_RATE_INCREMENT_NORMAL;

          // Check if target rate falls within this bracket
          if (
            dn.gte(targetRate, bracketRate) &&
            dn.lt(targetRate, dn.add(bracketRate, increment))
          ) {
            // Parse debtInFront from JSON string
            debtInFront =
              typeof bracket.debtInFront === "string"
                ? dn.from(JSON.parse(bracket.debtInFront)[0], 18)
                : dn.from(bracket.debtInFront, 18);

            found = true;
            break;
          }
        }

        // If rate is at the very bottom (below all brackets), debt in front is 0
        // If rate is at the very top, debt in front is all debt
        if (!found) {
          const firstBracket = chartData[0];
          if (
            firstBracket &&
            dn.lt(targetRate, dn.from(firstBracket.rate, 18))
          ) {
            debtInFront = DNUM_0;
          } else {
            // Rate is above all brackets, sum all debt
            debtInFront = chartData.reduce(
              (sum: Dnum, b: ChartDataPoint) =>
                dn.add(sum, dn.from(b.debt, 18)),
              DNUM_0
            );
          }
        }

        const totalDebt: Dnum = chartData.reduce(
          (sum: Dnum, b: ChartDataPoint) => dn.add(sum, dn.from(b.debt, 18)),
          DNUM_0
        );

        return {
          debtInFront: dn.toJSON(debtInFront),
          totalDebt: dn.toJSON(totalDebt),
        };
      }
    ),
  getRedemptionRisk: publicProcedure
    .input(
      z.object({
        branchId: z.number().optional().default(0),
        interestRate: z.string(), // Dnum as JSON
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
      // Calculate debt in front for the given interest rate
      const chartData = await calculateChartData(
        input.branchId,
        input.excludedLoan
      );

      const targetRate = dn.from(input.interestRate, 18);

      // Find the bracket containing this rate
      let debtInFront = DNUM_0;
      let found = false;

      for (const bracket of chartData) {
        const bracketRate = dn.from(bracket.rate, 18);
        const increment = dn.lt(bracketRate, INTEREST_RATE_PRECISE_UNTIL)
          ? INTEREST_RATE_INCREMENT_PRECISE
          : INTEREST_RATE_INCREMENT_NORMAL;

        // Check if target rate falls within this bracket
        if (
          dn.gte(targetRate, bracketRate) &&
          dn.lt(targetRate, dn.add(bracketRate, increment))
        ) {
          debtInFront = dn.from(bracket.debtInFront, 18);
          found = true;
          break;
        }
      }

      // If rate is at the very bottom (below all brackets), debt in front is 0
      // If rate is at the very top, debt in front is all debt
      if (!found) {
        const firstBracket = chartData[0];
        if (firstBracket && dn.lt(targetRate, dn.from(firstBracket.rate, 18))) {
          debtInFront = DNUM_0;
        } else {
          // Rate is above all brackets, sum all debt
          debtInFront = chartData.reduce(
            (sum: Dnum, b: ChartDataPoint) => dn.add(sum, dn.from(b.debt, 18)),
            DNUM_0
          );
        }
      }

      const totalDebt: Dnum = chartData.reduce(
        (sum: Dnum, b: ChartDataPoint) => dn.add(sum, dn.from(b.debt, 18)),
        DNUM_0
      );

      // Avoid division by zero - if no debt exists, risk is low
      if (dn.eq(totalDebt, DNUM_0)) {
        return {
          risk: "low" as const,
          debtInFront: dn.toJSON(debtInFront),
          totalDebt: dn.toJSON(totalDebt),
          percentilePosition: 100,
        };
      }

      const ratio = dn.toNumber(dn.div(debtInFront, totalDebt));

      // IMPORTANT: Lower debt in front = LOWER risk
      // If less than 10% of debt is ahead of you, you have LOW risk
      // If 10-25% of debt is ahead of you, you have MEDIUM risk
      // If more than 25% of debt is ahead of you, you have HIGH risk
      return {
        risk:
          ratio < 0.1
            ? ("low" as const)
            : ratio < 0.25
            ? ("medium" as const)
            : ("high" as const),
        debtInFront: dn.toJSON(debtInFront),
        totalDebt: dn.toJSON(totalDebt),
        percentilePosition: (1 - ratio) * 100,
      };
    }),
  getAverageInterestRate: publicProcedure
    .input(
      z.object({
        branchId: z.number().optional().default(0),
      })
    )
    .query(async ({ input }) => {
      const data = await fetchAllInterestRateBrackets();

      const filteredBrackets = data.brackets.filter(
        (bracket: InterestRateBracket) => bracket.branchId === input.branchId
      );

      let totalDebt = 0n;
      let weightedSum = 0n;

      for (const bracket of filteredBrackets) {
        const debt = bracket.totalDebt;
        const rate = bracket.rate;
        totalDebt += debt;
        // rate is already a Dnum with 18 decimals, just get the bigint value
        weightedSum += debt * rate[0];
      }

      return totalDebt > 0n
        ? Number(weightedSum / totalDebt) / 1e18
        : dn.toNumber(INTEREST_RATE_START);
    }),
});

export type InterestRouter = typeof interestRouter;
