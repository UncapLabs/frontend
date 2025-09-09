

/**
 * Computes the debt limit based on the collateral amount, the collateral price and the minimum collateral ratio
 * @param collateralAmount - The amount of collateral in BTC
 * @param bitcoinPrice - The price of Bitcoin in USD
 * @param minCollateralRatio - The minimum collateralization ratio (e.g., 1.1 = 110%)
 * @returns The debt limit in USD
 */
export function computeDebtLimit(
  collateralAmount: number,
  bitcoinPrice: number,
  minCollateralRatio: number
) {
  const collateralValue = collateralAmount * bitcoinPrice;
  return collateralValue / minCollateralRatio;
}

/**
 * Helper function to convert interest rate percentage to annual interest rate bigint
 * @param interestRate - The interest rate as a percentage (e.g., 5 for 5%)
 * @returns The annual interest rate as a bigint (18-decimal number)
 */
export function getAnnualInterestRate(interestRate: number): bigint {
  return BigInt(Math.floor(interestRate * 1e16)); // Convert percentage to 18-decimal number
}
