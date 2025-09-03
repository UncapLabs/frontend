import type { Dnum } from "dnum";

/**
 * Parse a JSON-serialized Dnum value from tRPC
 * @param value The value to parse (can be string or already parsed)
 * @returns The parsed Dnum
 */
export function parseJsonDnum(value: any): Dnum {
  if (typeof value === "string") {
    const parsed = JSON.parse(value);
    return [BigInt(parsed[0]), parsed[1]] as Dnum;
  }
  return value;
}

/**
 * Risk level types used in UI components
 */
export type RiskLevel = "high" | "medium" | "low";

/**
 * Convert API risk level (based on debt in front) to UI risk level
 * API: "high" debt in front = LOW redemption risk
 * API: "low" debt in front = HIGH redemption risk
 */
export function apiRiskToUiRisk(apiRisk: string): RiskLevel {
  const mapping: Record<string, RiskLevel> = {
    high: "low",    // high debt in front = low risk
    medium: "medium",
    low: "high",    // low debt in front = high risk
  };
  return mapping[apiRisk] || "medium";
}

/**
 * Calculate risk zone thresholds from chart data
 */
export interface RiskThresholds {
  highRisk: number;   // Position where high risk zone starts (0-1)
  mediumRisk: number; // Position where medium risk zone starts (0-1)
}

/**
 * Default risk thresholds based on debt in front percentages
 */
export const DEFAULT_RISK_THRESHOLDS: RiskThresholds = {
  highRisk: 0.1,    // < 10% debt in front = high risk
  mediumRisk: 0.25, // < 25% debt in front = medium risk
};