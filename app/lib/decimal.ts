import type { Dnum } from "dnum";
import * as dn from "dnum";
import Big from "big.js";

// Configure Big.js to handle crypto precision (up to 50 decimal places)
Big.DP = 50; // Decimal places
Big.RM = Big.roundDown; // Rounding mode

// Keep dnum exports for files that still need them (workers, interest-rate)
export const DNUM_0 = dn.from(0, 18);

export function dnum18(value: null | undefined): null;
export function dnum18(value: string | bigint | number): Dnum;
export function dnum18(
  value: string | bigint | number | null | undefined
): Dnum | null;
export function dnum18(
  value: string | bigint | number | null | undefined
): Dnum | null {
  return value === undefined || value === null ? null : [BigInt(value), 18];
}

/**
 * @deprecated Use bigintToBig instead - keeping for backward compatibility
 */
export function bigintToDecimal(value: bigint, decimals: number = 18): number {
  // Use Big.js for precision
  const big = bigintToBig(value, decimals);
  return Number(big.toString());
}

/**
 * @deprecated Use bigToBigint instead - keeping for backward compatibility  
 */
export function decimalToBigint(value: number, decimals: number = 18): bigint {
  // Use big.js for precise conversion
  const big = new Big(value);
  return bigToBigint(big, decimals);
}

/**
 * Convert a string to bigint using big.js for precision
 * @param value - The string value to convert
 * @param decimals - The number of decimal places
 * @returns A bigint representing the value in smallest units
 */
export function stringToBigint(value: string, decimals: number): bigint {
  // Use big.js for precise conversion
  const big = new Big(value);
  const scale = new Big(10).pow(decimals);
  const result = big.times(scale);
  // Convert to string with no decimal places, then to bigint
  return BigInt(result.toFixed(0));
}

/**
 * Convert a bigint to a string representation with decimals using big.js
 * @param value - The bigint value
 * @param decimals - The number of decimal places
 * @returns A string representing the decimal value
 */
export function bigintToString(value: bigint, decimals: number): string {
  // Convert bigint to Big
  const big = new Big(value.toString());
  const scale = new Big(10).pow(decimals);
  const result = big.div(scale);
  // Return as string, removing trailing zeros
  return result.toFixed();
}

/**
 * Convert a bigint to Big for precise decimal operations
 * @param value - The bigint value
 * @param decimals - The number of decimal places
 * @returns A Big instance representing the decimal value
 */
export function bigintToBig(value: bigint, decimals: number): Big {
  const big = new Big(value.toString());
  const scale = new Big(10).pow(decimals);
  return big.div(scale);
}

/**
 * Convert a Big instance back to bigint
 * @param value - The Big value
 * @param decimals - The number of decimal places to multiply by
 * @returns A bigint representing the value in smallest units
 */
export function bigToBigint(value: Big, decimals: number): bigint {
  const scale = new Big(10).pow(decimals);
  const result = value.times(scale);
  return BigInt(result.toFixed(0));
}
