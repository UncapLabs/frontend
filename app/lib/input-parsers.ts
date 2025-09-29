/**
 * Input parsing utilities for form fields
 * Using big.js for full precision decimal arithmetic
 */

import Big from "big.js";
import { bigintToBig } from "./decimal";

/**
 * Helper to handle percentage button clicks using big.js
 * Returns the calculated amount as a Big instance
 */
export function calculatePercentageAmountBig(
  balance: bigint,
  decimals: number,
  percentage: number
): Big {
  // Convert bigint to Big first (preserves precision)
  const balanceBig = bigintToBig(balance, decimals);
  
  // For MAX (100%), return exact value
  if (percentage === 100) {
    return balanceBig;
  }
  
  // Calculate percentage (divide by 100 to convert percentage to decimal)
  const percentageBig = new Big(percentage).div(100);
  const result = balanceBig.times(percentageBig);
  
  return result;
}
