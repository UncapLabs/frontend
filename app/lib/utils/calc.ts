import Big from "big.js";
import { bigToBigint } from "~/lib/decimal";

/**
 * Computes the debt limit based on the collateral amount, the collateral price and the minimum collateral ratio
 * @param collateralAmount - The amount of collateral in BTC
 * @param bitcoinPrice - The price of Bitcoin in USD
 * @param minCollateralRatio - The minimum collateralization ratio (e.g., 1.1 = 110%)
 * @returns The debt limit in USD as a Big instance
 */
export function computeDebtLimit(
  collateralAmount: Big,
  bitcoinPrice: Big,
  minCollateralRatio: Big
): Big {
  const collateralValue = collateralAmount.times(bitcoinPrice);
  return collateralValue.div(minCollateralRatio);
}

/**
 * Helper function to convert interest rate percentage to annual interest rate bigint
 * @param interestRate - The interest rate as a percentage (e.g., 5 for 5%)
 * @returns The annual interest rate as a bigint (18-decimal number)
 */
export function getAnnualInterestRate(interestRate: Big): bigint {
  // Convert percentage to 18-decimal number
  // Rate is in percentage (e.g., 5 for 5%), so divide by 100 first
  const rateDecimal = interestRate.div(100);
  return bigToBigint(rateDecimal, 18);
}
