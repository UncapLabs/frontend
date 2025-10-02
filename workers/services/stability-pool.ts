import { RpcProvider } from "starknet";
import { contractRead } from "~/lib/contracts/calls";
import { TOKENS, type CollateralId, COLLATERAL_TO_BRANCH } from "~/lib/collateral";
import { bigintToBig } from "~/lib/decimal";
import { getAverageInterestRateForBranch } from "./interest";
import Big from "big.js";

export async function fetchPoolPosition(
  provider: RpcProvider,
  userAddress: string,
  collateralType: CollateralId
) {
  try {
    const position = await contractRead.stabilityPool.getUserPosition(
      provider,
      userAddress,
      collateralType
    );

    const userDeposit = bigintToBig(position.deposit, TOKENS.USDU.decimals);
    const usduRewards = bigintToBig(position.usduGain, TOKENS.USDU.decimals);
    const collateralRewards = bigintToBig(position.collateralGain, 18);
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
    const totalDebtBig = bigintToBig(branchTotals.totalDebt, TOKENS.USDU.decimals);

    // APR formula: 75% of (average interest rate * (USDU supply / total deposits))
    if (totalDepositsBig.lte(0) || avgInterestRate <= 0 || totalDebtBig.lte(0)) {
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
    console.error(
      `Error calculating APR for ${collateralType}:`,
      error
    );
    return 0;
  }
}
