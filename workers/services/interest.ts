import { createGraphQLClient } from "~/lib/graphql/client";
import { ALL_INTEREST_RATE_BRACKETS } from "~/lib/graphql/documents";
import * as dn from "dnum";
import { type Dnum } from "~/lib/interest-rate-utils";

type InterestRateBracket = {
  branchId: number;
  rate: Dnum;
  totalDebt: bigint;
  sumDebtTimesRateD36: bigint;
  pendingDebtTimesOneYearD36: bigint;
  updatedAt: bigint;
};

// Shared function to fetch and parse interest rate brackets
export async function fetchAllInterestRateBrackets(): Promise<{
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
    .map((bracket: any) => ({
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

export async function getAverageInterestRateForBranch(
  branchId: number
): Promise<number> {
  try {
    const data = await fetchAllInterestRateBrackets();

    // Calculate the average interest rate for the specific branch
    const branchBrackets = data.brackets.filter((b) => b.branchId === branchId);
    
    if (branchBrackets.length === 0) {
      return 0;
    }

    let totalDebt = 0n;
    let weightedSum = 0n;

    for (const bracket of branchBrackets) {
      const debt = bracket.totalDebt;
      const rate = bracket.rate;
      totalDebt += debt;
      // rate is already a Dnum with 18 decimals, just get the bigint value
      weightedSum += debt * rate[0];
    }

    if (totalDebt === 0n) {
      return 0;
    }

    // Return average rate as decimal (e.g., 0.05 for 5%)
    return totalDebt > 0n
      ? Number(weightedSum / totalDebt) / 1e18
      : 0;
  } catch (error) {
    console.error(
      `Error fetching average interest rate for branch ${branchId}:`,
      error
    );
    return 0;
  }
}