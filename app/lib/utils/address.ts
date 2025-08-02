/**
 * Converts an address to a properly formatted hex string with padding
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