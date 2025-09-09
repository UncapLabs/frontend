import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a decimal number to bigint with proper precision
 * @param value - The decimal value to convert
 * @param decimals - Number of decimals (default 18)
 * @returns BigInt representation of the value
 */
export function toBigInt(value: number | undefined, decimals: number = 18): bigint {
  if (value === undefined || value === null) return 0n;
  return BigInt(Math.floor(value * 10 ** decimals));
}
