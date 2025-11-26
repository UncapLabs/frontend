import { RpcProvider } from "starknet";
import { contractRead } from "~/lib/contracts/calls";
import {
  TOKENS,
  type CollateralId,
  COLLATERAL_TO_BRANCH,
} from "~/lib/collateral";
import { bigintToBig } from "~/lib/decimal";
import { getAverageInterestRateForBranch } from "./interest";
import { DEFAULT_RETRY_OPTIONS, retryWithBackoff } from "./retry";
import Big from "big.js";

const CACHE_TTL = 30 * 60; // 30 minutes

export async function fetchPoolPosition(
  provider: RpcProvider,
  userAddress: string,
  collateralType: CollateralId
) {
  try {
    // Retry RPC calls with same logic as trove fetching
    const position = await retryWithBackoff(
      () =>
        contractRead.stabilityPool.getUserPosition(
          provider,
          userAddress,
          collateralType
        ),
      {
        ...DEFAULT_RETRY_OPTIONS,
        maxRetries: 2, // Match RPC retry count for consistency
      },
      `Stability pool position for ${collateralType}`
    );

    if (!position) {
      console.error(
        `Failed to fetch stability pool position for ${collateralType} after retries`
      );
      return null;
    }

    const userDeposit = bigintToBig(position.deposit, TOKENS.USDU.decimals);
    const usduRewards = bigintToBig(position.usduGain, TOKENS.USDU.decimals);
    // CRITICAL: Total collateral rewards = pending gains + stashed from previous compounds
    const collateralRewards = bigintToBig(
      position.collateralGain + position.stashedColl,
      18
    );
    const totalDeposits = bigintToBig(
      position.totalDeposits,
      TOKENS.USDU.decimals
    );

    const poolShare = totalDeposits.gt(0)
      ? userDeposit.div(totalDeposits).times(100)
      : new Big(0);

    return {
      userDeposit,
      rewards: {
        usdu: usduRewards,
        collateral: collateralRewards,
      },
      totalDeposits,
      poolShare,
    };
  } catch (error) {
    console.error(
      `Error fetching stability pool position for ${collateralType}:`,
      error
    );
    return null;
  }
}

export async function calculateStabilityPoolAPR(
  provider: RpcProvider,
  collateralType: CollateralId
): Promise<number> {
  try {
    const branchId = COLLATERAL_TO_BRANCH[collateralType];

    // Fetch data needed for APR calculation in parallel
    const [totalDeposits, avgInterestRate, branchTotals] = await Promise.all([
      // Get total deposits in the stability pool
      contractRead.stabilityPool.getTotalDeposits(provider, collateralType),
      // Get average interest rate for the branch
      getAverageInterestRateForBranch(branchId),
      // Get branch totals (includes totalDebt which we use as USDU supply proxy)
      contractRead.troveManager.getBranchTCR(provider, collateralType),
    ]);

    const totalDepositsBig = bigintToBig(totalDeposits, TOKENS.USDU.decimals);
    const totalDebtBig = bigintToBig(
      branchTotals.totalDebt,
      TOKENS.USDU.decimals
    );

    // APR formula: 75% of (average interest rate * (USDU supply / total deposits))
    if (
      totalDepositsBig.lte(0) ||
      avgInterestRate.lte(0) ||
      totalDebtBig.lte(0)
    ) {
      return 0;
    }

    // Convert avgInterestRate to Big for precise calculation
    const avgInterestRateBig = new Big(avgInterestRate);
    const aprBig = avgInterestRateBig
      .times(totalDebtBig.div(totalDepositsBig))
      .times(0.75)
      .times(100); // Convert to percentage

    // Return as number for backward compatibility
    return Number(aprBig.toString());
  } catch (error) {
    console.error(`Error calculating APR for ${collateralType}:`, error);
    return 0;
  }
}

/**
 * Get total deposits with caching support
 */
export async function getCachedTotalDeposits(
  env: Env,
  provider: RpcProvider,
  collateralType: CollateralId
): Promise<Big> {
  const cacheKey = `stability-pool-deposits-${collateralType}`;

  // Try to get from KV store first
  const cached = await env.CACHE.get(cacheKey, "text");
  if (cached) {
    return new Big(cached);
  }

  // Fetch fresh data from blockchain
  try {
    const totalDeposits = await contractRead.stabilityPool.getTotalDeposits(
      provider,
      collateralType
    );
    const result = bigintToBig(totalDeposits, TOKENS.USDU.decimals);

    // Cache the result as text
    await env.CACHE.put(cacheKey, result.toString(), {
      expirationTtl: CACHE_TTL,
    });

    return result;
  } catch (error) {
    console.error(
      `Error fetching total deposits for ${collateralType}:`,
      error
    );
    return new Big(0);
  }
}

/**
 * Get pool APR with caching support
 */
export async function getCachedPoolApr(
  env: Env,
  provider: RpcProvider,
  collateralType: CollateralId
): Promise<number> {
  const cacheKey = `stability-pool-apr-${collateralType}`;

  // Try to get from KV store first
  const cached = await env.CACHE.get(cacheKey, "text");
  if (cached) {
    return Number(cached);
  }

  // Calculate fresh APR
  const apr = await calculateStabilityPoolAPR(provider, collateralType);

  // Cache the result as text
  await env.CACHE.put(cacheKey, apr.toString(), {
    expirationTtl: CACHE_TTL,
  });

  return apr;
}
