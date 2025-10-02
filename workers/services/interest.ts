import { createGraphQLClient } from "~/lib/graphql/client";
import { ALL_INTEREST_RATE_BRACKETS } from "~/lib/graphql/documents";
import Big from "big.js";

type InterestRateBracket = {
  branchId: number;
  rate: Big;
  totalDebt: Big;
  sumDebtTimesRateD36: Big;
  pendingDebtTimesOneYearD36: Big;
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
      rate: new Big(bracket.rate).div(1e18),
      totalDebt: new Big(bracket.totalDebt).div(1e18),
      sumDebtTimesRateD36: new Big(bracket.sumDebtTimesRateD36 || "0").div(1e36),
      pendingDebtTimesOneYearD36: new Big(
        bracket.pendingDebtTimesOneYearD36 || "0"
      ).div(1e36),
      updatedAt: BigInt(bracket.updatedAt || "0"),
    }))
    .sort((a: InterestRateBracket, b: InterestRateBracket) =>
      a.rate.cmp(b.rate)
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
): Promise<Big> {
  try {
    const data = await fetchAllInterestRateBrackets();

    const branchBrackets = data.brackets.filter((b) => b.branchId === branchId);

    if (branchBrackets.length === 0) {
      return new Big(0);
    }

    let totalDebt = new Big(0);
    let weightedSum = new Big(0);

    for (const bracket of branchBrackets) {
      totalDebt = totalDebt.plus(bracket.totalDebt);
      weightedSum = weightedSum.plus(bracket.totalDebt.times(bracket.rate));
    }

    if (totalDebt.eq(0)) {
      return new Big(0);
    }

    return weightedSum.div(totalDebt);
  } catch (error) {
    console.error(
      `Error fetching average interest rate for branch ${branchId}:`,
      error
    );
    return new Big(0);
  }
}