import { RpcProvider } from "starknet";
import { contractRead } from "~/lib/contracts/calls";
import { USDU_TOKEN, type CollateralType } from "~/lib/contracts/constants";
import { bigintToDecimal } from "~/lib/decimal";

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
    // Return default values on error
    return {
      userDeposit: 0,
      rewards: {
        usdu: 0,
        collateral: 0,
      },
      totalDeposits: 0,
      poolShare: 0,
    };
  }
}
