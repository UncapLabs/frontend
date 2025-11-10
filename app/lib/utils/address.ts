import { type Address } from "@starknet-react/core";
import { getChecksumAddress } from "starknet";

/**
 * Converts an address to a properly formatted hex string with padding
 * This is the canonical format for address comparison
 * @param address - The address as string, bigint, or number
 * @returns Hex string padded to 64 characters with 0x prefix
 */
export function toHexAddress(address: string | bigint | number): string {
  let addy: bigint;
  if (typeof address === 'string') {
    // Handle hex strings with or without 0x prefix
    if (address.startsWith('0x')) {
      addy = BigInt(address);
    } else {
      addy = BigInt('0x' + address);
    }
  } else if (typeof address === 'number') {
    addy = BigInt(address);
  } else {
    addy = address;
  }
  const hexString = addy.toString(16);
  const paddedHex = hexString.padStart(64, '0');
  return `0x${paddedHex}`;
}

/**
 * Normalizes an address using Starknet's checksum format
 * @param address - The address to normalize
 * @returns Checksummed address
 */
export const normalizeAddress = (address: string) =>
  getChecksumAddress(address) as Address;

/**
 * Formats an address for display by truncating the middle
 * @param address - The address to format
 * @returns Truncated address like "0x1234…5678"
 */
export const formatTruncatedAddress = (address: string) => {
  const normalized = normalizeAddress(address);
  const hex = normalized.slice(0, 2);
  const start = normalized.slice(2, 6);
  const end = normalized.slice(-4);
  return `${hex}${start}…${end}`;
};

/**
 * Compares two Starknet addresses for equality
 * Handles different padding formats and null/undefined values
 * @param addr1 - First address to compare
 * @param addr2 - Second address to compare
 * @returns true if addresses are equal, false otherwise
 */
export function areAddressesEqual(
  addr1: string | null | undefined,
  addr2: string | null | undefined
): boolean {
  // Handle null/undefined cases
  if (!addr1 && !addr2) return true;
  if (!addr1 || !addr2) return false;

  // Treat "0x0" as equivalent to null
  const isZero1 = addr1 === "0x0" || addr1 === "0x00" || addr1 === "0";
  const isZero2 = addr2 === "0x0" || addr2 === "0x00" || addr2 === "0";

  if (isZero1 && isZero2) return true;
  if (isZero1 || isZero2) return false;

  // Normalize both addresses to padded hex format for comparison
  try {
    return toHexAddress(addr1) === toHexAddress(addr2);
  } catch {
    // If conversion fails, fall back to string comparison
    return addr1 === addr2;
  }
}
