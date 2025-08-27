import type { CollateralType } from "~/lib/contracts/constants";

interface TCRValidationParams {
  currentTotalCollateral: number; // in token units
  currentTotalDebt: number; // in USDU
  collateralPrice: number; // in USD
  ccr: number; // as decimal (e.g., 1.1 for 110%)
  
  // Operation changes (positive for increase, negative for decrease)
  collateralChange?: number; // in token units
  debtChange?: number; // in USDU
}

/**
 * Calculate the resulting TCR after an operation
 */
export function calculateResultingTCR(params: TCRValidationParams): number | null {
  const {
    currentTotalCollateral,
    currentTotalDebt,
    collateralPrice,
    collateralChange = 0,
    debtChange = 0,
  } = params;

  // Calculate new totals after the operation
  const newTotalCollateral = currentTotalCollateral + collateralChange;
  const newTotalDebt = currentTotalDebt + debtChange;

  // Can't have negative collateral or debt
  if (newTotalCollateral < 0 || newTotalDebt < 0) {
    return null;
  }

  // If debt would be 0, TCR is infinite (valid)
  if (newTotalDebt === 0) {
    return Infinity;
  }

  // Calculate TCR: (collateral value in USD) / debt
  const collateralValueUSD = newTotalCollateral * collateralPrice;
  const tcr = collateralValueUSD / newTotalDebt;

  return tcr;
}

/**
 * Check if an operation would violate the TCR requirement
 */
export function wouldViolateTCR(params: TCRValidationParams): boolean {
  const resultingTCR = calculateResultingTCR(params);
  
  if (resultingTCR === null) {
    return true; // Invalid operation
  }
  
  if (resultingTCR === Infinity) {
    return false; // No debt = always valid
  }

  // Check if resulting TCR would be below CCR
  return resultingTCR < params.ccr;
}

/**
 * Get a user-friendly message about TCR validation
 */
export function getTCRValidationMessage(params: TCRValidationParams): string | null {
  const resultingTCR = calculateResultingTCR(params);
  
  if (resultingTCR === null) {
    return "Invalid operation";
  }
  
  if (resultingTCR === Infinity) {
    return null; // Valid - no message needed
  }

  const ccrPercentage = (params.ccr * 100).toFixed(0);
  const tcrPercentage = (resultingTCR * 100).toFixed(1);

  if (resultingTCR < params.ccr) {
    return `This operation would reduce the system TCR to ${tcrPercentage}%, which is below the critical threshold of ${ccrPercentage}%. The protocol is in recovery mode.`;
  }

  return null; // Valid - no message needed
}

/**
 * Calculate individual position TCR
 */
export function calculatePositionTCR(
  collateralAmount: number,
  debtAmount: number,
  collateralPrice: number
): number | null {
  if (debtAmount <= 0) {
    return Infinity;
  }
  
  const collateralValueUSD = collateralAmount * collateralPrice;
  return collateralValueUSD / debtAmount;
}

/**
 * Check if opening a new position would violate system TCR
 */
export function wouldOpeningViolateTCR(
  newCollateral: number,
  newDebt: number,
  currentTotalCollateral: number,
  currentTotalDebt: number,
  collateralPrice: number,
  ccr: number
): boolean {
  return wouldViolateTCR({
    currentTotalCollateral,
    currentTotalDebt,
    collateralPrice,
    ccr,
    collateralChange: newCollateral,
    debtChange: newDebt,
  });
}