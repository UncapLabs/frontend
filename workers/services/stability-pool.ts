import { RpcProvider } from "starknet";
import { contractRead } from "~/lib/contracts/calls";
import { USDU_TOKEN, type CollateralType, COLLATERAL_TO_BRANCH } from "~/lib/contracts/constants";
import { bigintToDecimal } from "~/lib/decimal";
import { getAverageInterestRateForBranch } from "./interest";

export async function fetchPoolPosition(
  provider: RpcProvider,
  userAddress: string,
  collateralType: CollateralType
) {
  try {
    const position = await contractRead.stabilityPool.getUserPosition(
      provider,
      userAddress,
      collateralType
    );

    const userDeposit = bigintToDecimal(position.deposit, USDU_TOKEN.decimals);
    const usduRewards = bigintToDecimal(position.usduGain, USDU_TOKEN.decimals);
    const collateralRewards = bigintToDecimal(position.collateralGain, 18);
    const totalDeposits = bigintToDecimal(
      position.totalDeposits,
      USDU_TOKEN.decimals
    );

    return {
      userDeposit,
      rewards: {
        usdu: usduRewards,
        collateral: collateralRewards,
      },
      totalDeposits,
      poolShare: totalDeposits > 0 ? (userDeposit / totalDeposits) * 100 : 0,
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
  collateralType: CollateralType
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

    const totalDepositsDecimal = bigintToDecimal(totalDeposits, USDU_TOKEN.decimals);
    const totalDebtDecimal = bigintToDecimal(branchTotals.totalDebt, USDU_TOKEN.decimals);

    // APR formula: 75% of (average interest rate * (USDU supply / total deposits))
    if (totalDepositsDecimal <= 0 || avgInterestRate <= 0 || totalDebtDecimal <= 0) {
      return 0;
    }

    const aprDecimal = 0.75 * avgInterestRate * (totalDebtDecimal / totalDepositsDecimal);
    return aprDecimal * 100; // Convert to percentage
  } catch (error) {
    console.error(
      `Error calculating APR for ${collateralType}:`,
      error
    );
    return 0;
  }
}
