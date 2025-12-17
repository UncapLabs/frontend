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
  const indexer = process.env.NETWORK || "sepolia";

  const result = await graphqlClient.request(ALL_INTEREST_RATE_BRACKETS, {
    indexer,
  });

  if (!result.interestratebrackets) {
    return {
      lastUpdatedAt: 0n,
      brackets: [],
    };
  }

  const brackets: InterestRateBracket[] = result.interestratebrackets
    .map((bracket: { collateral: { collIndex: number }; rate: string; totalDebt: string; sumDebtTimesRateD36?: string; pendingDebtTimesOneYearD36?: string; updatedAt?: number }) => ({
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

export interface BranchStats {
  branchId: number;
  averageRate: string;
  lowestRate: string;
  totalDebt: string;
}

/**
 * Get stats for each branch: average rate, lowest rate, total debt
 */
export async function getAllBranchesStats(): Promise<BranchStats[]> {
  try {
    const data = await fetchAllInterestRateBrackets();

    if (data.brackets.length === 0) {
      return [];
    }

    // Group brackets by branch
    const branchMap = new Map<number, {
      totalDebt: Big;
      weightedSum: Big;
      lowestRate: Big | null;
    }>();

    for (const bracket of data.brackets) {
      if (bracket.totalDebt.lte(0)) continue;

      const existing = branchMap.get(bracket.branchId);

      if (existing) {
        existing.totalDebt = existing.totalDebt.plus(bracket.totalDebt);
        existing.weightedSum = existing.weightedSum.plus(
          bracket.totalDebt.times(bracket.rate)
        );
        if (existing.lowestRate === null || bracket.rate.lt(existing.lowestRate)) {
          existing.lowestRate = bracket.rate;
        }
      } else {
        branchMap.set(bracket.branchId, {
          totalDebt: bracket.totalDebt,
          weightedSum: bracket.totalDebt.times(bracket.rate),
          lowestRate: bracket.rate,
        });
      }
    }

    const results: BranchStats[] = [];

    for (const [branchId, stats] of branchMap) {
      const averageRate = stats.totalDebt.gt(0)
        ? stats.weightedSum.div(stats.totalDebt)
        : new Big(0);

      results.push({
        branchId,
        averageRate: averageRate.toString(),
        lowestRate: stats.lowestRate?.toString() ?? "0",
        totalDebt: stats.totalDebt.toString(),
      });
    }

    // Sort by branchId for consistent ordering
    results.sort((a, b) => a.branchId - b.branchId);

    return results;
  } catch (error) {
    console.error("Error fetching all branches stats:", error);
    return [];
  }
}

/**
 * Get debt-in-front for multiple positions efficiently (single fetch).
 * Debt-in-front is calculated per branch - only debt from the same branch counts.
 *
 * @param positions Array of { branchId, interestRate } to calculate debt-in-front for
 * @returns Map of "branchId:rate" -> debtInFront
 */
export async function getDebtInFrontForPositions(
  positions: Array<{ branchId: number; interestRate: Big }>
): Promise<Map<string, Big>> {
  try {
    const data = await fetchAllInterestRateBrackets();
    const result = new Map<string, Big>();

    // Group brackets by branch and sort by rate
    const bracketsByBranch = new Map<number, typeof data.brackets>();

    for (const bracket of data.brackets) {
      const existing = bracketsByBranch.get(bracket.branchId) ?? [];
      existing.push(bracket);
      bracketsByBranch.set(bracket.branchId, existing);
    }

    // Sort each branch's brackets by rate
    for (const brackets of bracketsByBranch.values()) {
      brackets.sort((a, b) => a.rate.cmp(b.rate));
    }

    // Calculate debt-in-front for each position
    for (const pos of positions) {
      const key = `${pos.branchId}:${pos.interestRate.toString()}`;

      // Skip if already calculated (same branch + rate)
      if (result.has(key)) continue;

      const branchBrackets = bracketsByBranch.get(pos.branchId) ?? [];
      let debtInFront = new Big(0);

      for (const bracket of branchBrackets) {
        if (bracket.rate.lt(pos.interestRate)) {
          debtInFront = debtInFront.plus(bracket.totalDebt);
        } else {
          // Brackets are sorted, so we can break early
          break;
        }
      }

      result.set(key, debtInFront);
    }

    return result;
  } catch (error) {
    console.error("Error calculating debt-in-front for positions:", error);
    return new Map();
  }
}