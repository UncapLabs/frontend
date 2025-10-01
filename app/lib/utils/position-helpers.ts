import type { Position } from "workers/services/trove-service";
import Big from "big.js";
import { bigToBigint } from "~/lib/decimal";
import type { CollateralId } from "../collateral";

/**
 * Convert position interest rate to BigInt format for contracts
 * Interest rate is a percentage (e.g., 5 for 5%), need to convert to 18 decimal format
 */
export function getAnnualInterestRateAsBigInt(position: Position): bigint {
  // position.interestRate is now a Big representing percentage (e.g., 5 for 5%)
  // Convert to decimal (0.05) then to 18 decimal bigint
  const decimalRate = position.interestRate.div(100);
  return bigToBigint(decimalRate, 18);
}

/**
 * Get position interest rate as percentage Big
 * Returns Big to maintain precision
 */
export function getInterestRatePercentage(position: Position): Big {
  return position.interestRate;
}

/**
 * Extract trove ID from the full position ID
 * Position IDs are in format "branchId:hexId"
 */
export function extractTroveId(positionId: string): bigint {
  const hexPart = positionId.split(":")[1] || "0";
  return BigInt(hexPart);
}

/**
 * Get collateral type from position
 */
export function getCollateralType(position: Position): CollateralId {
  return position.collateralAsset as CollateralId;
}
