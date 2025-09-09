/**
 * Common validation utilities for transaction forms
 */

export const validators = {
  /**
   * Validates that the value doesn't exceed the available balance
   */
  insufficientBalance: (value: number, balance: number) => {
    return value > balance ? "Insufficient balance" : undefined;
  },

  /**
   * Validates minimum amount requirements
   */
  minimumAmount: (value: number, minimum: number, symbol: string) =>
    value < minimum ? `Minimum amount is ${minimum} ${symbol}` : undefined,

  /**
   * Validates maximum amount limits
   */
  maximumAmount: (value: number, maximum: number) =>
    value > maximum
      ? `Maximum amount is ${maximum.toLocaleString()}`
      : undefined,

  /**
   * Validates minimum USD value requirements
   */
  minimumUsdValue: (value: number, price: number, minimumUsd: number) => {
    const usdValue = value * price;
    return usdValue < minimumUsd
      ? `Minimum value is $${minimumUsd.toLocaleString()}`
      : undefined;
  },

  /**
   * Validates that collateral is required before borrowing
   */
  requiresCollateral: (borrowAmount: number, collateralAmount?: number) =>
    borrowAmount > 0 && (!collateralAmount || collateralAmount <= 0)
      ? "Please enter collateral amount first"
      : undefined,

  /**
   * Validates LTV ratio
   */
  ltvRatio: (
    borrowValue: number,
    collateralValue: number,
    maxLtvPercent: number
  ) => {
    if (collateralValue <= 0) return undefined;
    const ltv = (borrowValue / collateralValue) * 100;
    return ltv > maxLtvPercent
      ? `LTV ratio too high (max ${maxLtvPercent}%)`
      : undefined;
  },

  /**
   * Validates debt limit
   */
  debtLimit: (value: number, maxDebt: number) =>
    value > maxDebt ? "Exceeds maximum borrowable amount" : undefined,

  /**
   * Validates minimum debt requirement ($2000)
   */
  minimumDebt: (value: number, minDebt: number = 2000) =>
    value < minDebt
      ? `Minimum debt is $${minDebt.toLocaleString()}`
      : undefined,

  /**
   * Validates minimum collateral ratio for withdrawals
   */
  minimumCollateralRatio: (
    newCollateralValue: number,
    debtValue: number,
    minRatio: number = 1.1 // 110% minimum
  ) => {
    if (debtValue <= 0) return undefined;
    const ratio = newCollateralValue / debtValue;
    return ratio < minRatio
      ? `Must maintain at least ${(minRatio * 100).toFixed(
          0
        )}% collateral ratio`
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
  percentage: (value: number) => {
    if (value < 0) return "Percentage must be positive";
    if (value > 100) return "Percentage cannot exceed 100%";
    return undefined;
  },

  /**
   * Validates interest rate
   */
  interestRate: (value: number, min: number, max: number) => {
    if (value < min) return `Interest rate must be at least ${min}%`;
    if (value > max) return `Interest rate cannot exceed ${max}%`;
    return undefined;
  },

  /**
   * Validates zombie trove debt adjustments
   * Zombie troves cannot have debt between 0 and MIN_DEBT (exclusive)
   */
  zombieTroveDebt: (
    newDebt: number,
    currentDebt: number,
    minDebt: number,
    isZombie: boolean
  ) => {
    if (!isZombie) return undefined;

    // Cannot reduce debt to a value between 0 and MIN_DEBT
    if (newDebt > 0 && newDebt < minDebt) {
      if (newDebt < currentDebt) {
        return `Cannot reduce debt below ${minDebt} USDU while in zombie state. Either maintain at least ${minDebt} USDU or close the position entirely`;
      }
      return `Zombie positions must have at least ${minDebt} USDU debt or be closed entirely`;
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
