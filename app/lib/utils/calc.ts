export const MINIMUM_COLLATERAL_RATIO = 1.1;
export const MAX_LTV = 1 / MINIMUM_COLLATERAL_RATIO;

export const MAX_LIMIT = 100000000;

/**
 * Computes the debt limit based on the collateral amount, the collateral price and the minimum collateral ratio
 * @param collateralAmount - The amount of collateral in BTC
 * @param bitcoinPrice - The price of Bitcoin in USD
 * @returns The debt limit in USD
 */
export function computeDebtLimit(
  collateralAmount: number,
  bitcoinPrice: number
) {
  const collateralValue = collateralAmount * bitcoinPrice;
  return collateralValue / MINIMUM_COLLATERAL_RATIO;
}

/**
 * Computes the liquidation price based on the collateral amount, the debt and the bitUSD price
 * @param collateralAmount - The amount of collateral in BTC
 * @param debt - The amount of debt in bitUSD
 * @param bitUSDPrice - The price of bitUSD in USD
 * @returns The liquidation price in USD
 */
export function computeLiquidationPrice(
  collateralAmount: number,
  debt: number,
  bitUSDPrice: number
) {
  const collateralValue = collateralAmount * bitUSDPrice;
  const debtValue = debt * bitUSDPrice;

  return (debtValue * MINIMUM_COLLATERAL_RATIO) / collateralValue;
}

/**
 * Computes the health factor based on the collateral amount and the debt
 * @param collateralAmount - The amount of collateral in BTC
 * @param debtAmount - The amount of debt in bitUSD
 * @param bitcoinPrice - The price of Bitcoin in USD
 * @returns The health factor
 */
export function computeHealthFactor(
  collateralAmount: number,
  debtAmount: number,
  bitcoinPrice: number
) {
  const collateralValue = collateralAmount * bitcoinPrice;
  return collateralValue / (debtAmount * MINIMUM_COLLATERAL_RATIO);
}

/**
 * Computes the borrow amount from the LTV
 * @param ltv - The LTV
 * @param collateralAmount - The amount of collateral in BTC
 * @param bitcoinPrice - The price of Bitcoin in USD
 * @returns The borrow amount in BTC
 */
export function computeBorrowAmountFromLTV(
  ltv: number,
  collateralAmount: number,
  bitcoinPrice: number
) {
  const collateralValue = collateralAmount * bitcoinPrice;
  return (collateralValue * ltv) / 100;
}

/**
 * Computes the LTV from the borrow amount
 * @param borrowAmount - The amount of borrow in bitUSD
 * @param collateralAmount - The amount of collateral in BTC
 * @param bitcoinPrice - The price of Bitcoin in USD
 * @returns The LTV
 */
export function computeLTVFromBorrowAmount(
  borrowAmount: number,
  collateralAmount: number,
  bitcoinPrice: number
) {
  const collateralValue = collateralAmount * bitcoinPrice;
  return borrowAmount / collateralValue;
}

/**
 * Helper function to convert interest rate percentage to annual interest rate bigint
 * @param interestRate - The interest rate as a percentage (e.g., 5 for 5%)
 * @returns The annual interest rate as a bigint (18-decimal number)
 */
export function getAnnualInterestRate(interestRate: number): bigint {
  return BigInt(Math.floor(interestRate * 1e16)); // Convert percentage to 18-decimal number
}
