import { INTEREST_RATE_SCALE_DOWN_FACTOR } from "~/lib/contracts/constants";
import type { Position } from "~/workers/services/trove-service";

/**
 * Convert position interest rate to BigInt format for contracts
 */
export function getAnnualInterestRateAsBigInt(position: Position): bigint {
  return BigInt(Math.floor(position.interestRate * 1e16));
}

/**
 * Convert position interest rate to percentage for display
 */
export function getInterestRatePercentage(position: Position): number {
  return position.interestRate;
}

/**
 * Extract trove ID from the full position ID
 * Position IDs are in format "branchId:hexId"
 */
export function extractTroveId(positionId: string): bigint {
  const hexPart = positionId.split(':')[1] || '0';
  return BigInt(hexPart);
}

/**
 * Get collateral type from position
 */
export function getCollateralType(position: Position): "UBTC" | "GBTC" {
  return position.collateralAsset as "UBTC" | "GBTC";
}