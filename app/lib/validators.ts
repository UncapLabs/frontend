/**
 * Validation utilities for transaction forms
 * All validators use Big.js for full precision decimal arithmetic
 */

import Big from "big.js";

export const validators = {
  /**
   * Validates that the value doesn't exceed the available balance
   * @param value - The amount to validate (Big instance)
   * @param balance - The available balance (Big instance)
   */
  insufficientBalance: (value: Big, balance: Big) => {
    return value.gt(balance) ? "Insufficient balance" : undefined;
  },

  /**
   * Validates minimum amount requirements
   */
  minimumAmount: (value: Big, minimum: Big, symbol: string) => {
    return value.lt(minimum)
      ? `Minimum amount is ${minimum.toFixed()} ${symbol}`
      : undefined;
  },

  /**
   * Validates maximum amount limits
   */
  maximumAmount: (value: Big, maximum: Big) => {
    return value.gt(maximum)
      ? `Maximum amount is ${maximum.toFixed()}`
      : undefined;
  },

  /**
   * Validates minimum USD value requirements
   */
  minimumUsdValue: (value: Big, price: Big, minimumUsd: Big) => {
    const usdValue = value.times(price);
    return usdValue.lt(minimumUsd)
      ? `Minimum value is $${minimumUsd.toFixed()}`
      : undefined;
  },

  /**
   * Validates that collateral is required before borrowing
   */
  requiresCollateral: (borrowAmount: Big, collateralAmount?: Big) => {
    const zeroBig = new Big(0);

    if (borrowAmount.lte(zeroBig)) return undefined;

    if (!collateralAmount) {
      return "Please enter collateral amount first";
    }

    return collateralAmount.lte(zeroBig)
      ? "Please enter collateral amount first"
      : undefined;
  },

  /**
   * Validates LTV ratio
   */
  ltvRatio: (borrowValue: Big, collateralValue: Big, maxLtvPercent: Big) => {
    const zeroBig = new Big(0);

    if (collateralValue.lte(zeroBig)) return undefined;

    // Calculate LTV: (borrowValue / collateralValue) * 100
    const ltv = borrowValue.div(collateralValue).times(100);

    return ltv.gt(maxLtvPercent)
      ? `LTV ratio too high (max ${maxLtvPercent.toFixed()}%)`
      : undefined;
  },

  /**
   * Validates debt limit
   */
  debtLimit: (value: Big, maxDebt: Big) => {
    return value.gt(maxDebt)
      ? "Exceeds maximum borrowable amount"
      : undefined;
  },

  /**
   * Validates minimum debt requirement
   */
  minimumDebt: (value: Big, minDebt: Big = new Big(200)) => {
    return value.lt(minDebt)
      ? `Minimum debt is $${minDebt.toFixed()}`
      : undefined;
  },

  /**
   * Validates minimum collateral ratio for withdrawals
   */
  minimumCollateralRatio: (
    newCollateralValue: Big,
    debtValue: Big,
    minRatio: Big = new Big(1.1) // 110% minimum
  ) => {
    const zeroBig = new Big(0);
    if (debtValue.lte(zeroBig)) return undefined;
    
    const ratio = newCollateralValue.div(debtValue);
    return ratio.lt(minRatio)
      ? `Must maintain at least ${minRatio.times(100).toFixed(0)}% collateral ratio`
      : undefined;
  },

  /**
   * Validates wallet connection
   */
  requiresWallet: (value: any, isConnected: boolean) =>
    value && !isConnected ? "Please connect your wallet" : undefined,

  /**
   * Validates percentage input (0-100)
   */
  percentage: (value: Big) => {
    const zeroBig = new Big(0);
    const hundredBig = new Big(100);
    
    if (value.lt(zeroBig)) return "Percentage must be positive";
    if (value.gt(hundredBig)) return "Percentage cannot exceed 100%";
    return undefined;
  },

  /**
   * Validates interest rate
   */
  interestRate: (value: Big, min: Big, max: Big) => {
    if (value.lt(min)) return `Interest rate must be at least ${min.toFixed()}%`;
    if (value.gt(max)) return `Interest rate cannot exceed ${max.toFixed()}%`;
    return undefined;
  },

  /**
   * Validates zombie trove debt adjustments
   * Zombie troves cannot have debt between 0 and MIN_DEBT (exclusive)
   */
  zombieTroveDebt: (
    newDebt: Big,
    currentDebt: Big,
    minDebt: Big,
    isZombie: boolean
  ) => {
    if (!isZombie) return undefined;

    const zeroBig = new Big(0);

    // Cannot reduce debt to a value between 0 and MIN_DEBT
    if (newDebt.gt(zeroBig) && newDebt.lt(minDebt)) {
      if (newDebt.lt(currentDebt)) {
        return `Cannot reduce debt below ${minDebt.toFixed()} USDU while in zombie state. Either maintain at least ${minDebt.toFixed()} USDU or close the position entirely`;
      }
      return `Zombie positions must have at least ${minDebt.toFixed()} USDU debt or be closed entirely`;
    }

    return undefined;
  },

  /**
   * Compose multiple validators
   * Returns the first error found or undefined if all pass
   */
  compose: (...validatorResults: (string | undefined)[]) => {
    return validatorResults.find((result) => result !== undefined);
  },
};

/**
 * Helper to create a validator that only runs when a condition is met
 */
export const conditionalValidator = (
  condition: boolean,
  validator: () => string | undefined
) => {
  return condition ? validator() : undefined;
};
