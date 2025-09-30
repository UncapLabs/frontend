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
