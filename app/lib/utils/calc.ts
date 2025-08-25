export const MINIMUM_COLLATERAL_RATIO = 1.1; // Default, kept for backward compatibility
export const MAX_LTV = 1 / MINIMUM_COLLATERAL_RATIO;

export const MAX_LIMIT = 100000000;

/**
 * Computes the debt limit based on the collateral amount, the collateral price and the minimum collateral ratio
 * @param collateralAmount - The amount of collateral in BTC
 * @param bitcoinPrice - The price of Bitcoin in USD
 * @param minCollateralRatio - The minimum collateralization ratio (default 1.1 = 110%)
 * @returns The debt limit in USD
 */
export function computeDebtLimit(
  collateralAmount: number,
  bitcoinPrice: number,
  minCollateralRatio: number = MINIMUM_COLLATERAL_RATIO
) {
  const collateralValue = collateralAmount * bitcoinPrice;
  return collateralValue / minCollateralRatio;
}

/**
 * Computes the liquidation price based on the collateral amount and the debt
 * @param collateralAmount - The amount of collateral in BTC
 * @param debt - The amount of debt in USDU
 * @param usduPrice - The price of USDU in USD (typically 1.0)
 * @param minCollateralRatio - The minimum collateralization ratio (default 1.1 = 110%)
 * @returns The liquidation price of BTC in USD
 */
export function computeLiquidationPrice(
  collateralAmount: number,
  debt: number,
  usduPrice: number = 1.0,
  minCollateralRatio: number = MINIMUM_COLLATERAL_RATIO
) {
  if (collateralAmount === 0) return 0;
  
  // Liquidation occurs when: collateral_value = debt * minCollateralRatio
  // So: collateral_amount * btc_price = debt * minCollateralRatio
  // Therefore: btc_price = (debt * minCollateralRatio) / collateral_amount
  const debtValue = debt * usduPrice;
  return (debtValue * minCollateralRatio) / collateralAmount;
}

/**
 * Computes the health factor based on the collateral amount and the debt
 * @param collateralAmount - The amount of collateral in BTC
 * @param debtAmount - The amount of debt in usdu
 * @param bitcoinPrice - The price of Bitcoin in USD
 * @param minCollateralRatio - The minimum collateralization ratio (default 1.1 = 110%)
 * @returns The health factor
 */
export function computeHealthFactor(
  collateralAmount: number,
  debtAmount: number,
  bitcoinPrice: number,
  minCollateralRatio: number = MINIMUM_COLLATERAL_RATIO
) {
  const collateralValue = collateralAmount * bitcoinPrice;
  return collateralValue / (debtAmount * minCollateralRatio);
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
 * @param borrowAmount - The amount of borrow in usdu
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
