// Shared constants and utilities for interest rate visualization
// This file consolidates duplicated code from interest-slider.tsx and interest-rate-slider.tsx

import type { Dnum } from "./interest-rate-utils";

// Risk level types
export type RiskLevel = "low" | "medium" | "high";

// Risk color mappings - single source of truth
export const RISK_COLORS = {
  high: "#dc2626", // red-600 - high risk (low debt in front)
  mediumHigh: "#ea580c", // orange-600
  medium: "#f59e0b", // amber-500 - medium risk
  mediumLow: "#84cc16", // lime-500
  low: "#22c55e", // green-500 - low risk (high debt in front)
} as const;

// Dimmed colors for background gradients
export const RISK_COLORS_DIMMED = {
  high: "rgba(220, 38, 38, 0.2)",
  medium: "rgba(245, 158, 11, 0.2)",
  low: "rgba(34, 197, 94, 0.2)",
} as const;

// Handle color mapping for slider components
export const HANDLE_COLORS = {
  0: RISK_COLORS.high,    // high risk - red
  1: RISK_COLORS.medium,  // medium risk - yellow
  2: RISK_COLORS.low,     // low risk - green
} as const;

// Radix UI thumb color classes
export const THUMB_COLOR_CLASSES = {
  0: "border-red-500 bg-red-500",
  1: "border-yellow-500 bg-yellow-500",
  2: "border-green-500 bg-green-500",
} as const;

// Gradient mode types
export type GradientMode = "low-to-high" | "high-to-low";

// Get gradient colors based on mode
export function getGradientColors(mode: GradientMode = "high-to-low") {
  const colors = [
    RISK_COLORS.high,
    RISK_COLORS.mediumHigh,
    RISK_COLORS.medium,
    RISK_COLORS.mediumLow,
    RISK_COLORS.low,
  ];
  return mode === "low-to-high" ? colors : colors.reverse();
}

// Get dimmed gradient colors based on mode
export function getGradientColorsDimmed(mode: GradientMode = "high-to-low") {
  const colors = [
    RISK_COLORS_DIMMED.high,
    RISK_COLORS_DIMMED.medium,
    RISK_COLORS_DIMMED.low,
  ];
  return mode === "low-to-high" ? colors : colors.reverse();
}

// Map risk level to handle color index
export function riskLevelToHandleColor(risk: RiskLevel): 0 | 1 | 2 {
  switch (risk) {
    case "low": return 0;  // high risk = red
    case "medium": return 1; // medium risk = yellow
    case "high": return 2;   // low risk = green
  }
}

// Map risk level to color
export function riskLevelToColor(risk: RiskLevel): string {
  switch (risk) {
    case "low": return RISK_COLORS.high;   // high risk = red
    case "medium": return RISK_COLORS.medium; // medium risk = yellow
    case "high": return RISK_COLORS.low;    // low risk = green
  }
}

// Calculate handle color based on position and gradient thresholds
export function calculateHandleColor(
  value: number,
  gradient?: [number, number],
  riskLevel?: RiskLevel
): string {
  // If we have explicit risk level from tRPC, use it
  if (riskLevel) {
    return riskLevelToColor(riskLevel);
  }

  // Otherwise calculate based on gradient thresholds
  if (gradient) {
    if (value <= gradient[0]) return RISK_COLORS.high;
    if (value <= gradient[1]) return RISK_COLORS.medium;
    return RISK_COLORS.low;
  }

  return "#ffffff";
}

// Chart rendering constants
export const CHART_CONSTANTS = {
  BAR_HEIGHT: 4,
  HANDLE_SIZE: 26,
  MIN_WIDTH: 26 * 2,
  CHART_MAX_HEIGHT: 30,
  HEIGHT: 60,
  GRADIENT_TRANSITION_BLUR: 4,
} as const;

// Normalize chart data for rendering (if not already normalized by tRPC)
export function normalizeChartData(chart: number[]): number[] {
  if (!chart || chart.length === 0) return [];
  const max = Math.max(...chart);
  if (max === 0) return chart.map(() => 0);
  return chart.map((v) => v / max);
}

// Calculate gradient geometry for risk zones
export function calculateGradientGeometry(gradient?: [number, number]) {
  if (!gradient) return null;
  const steps = [0, ...gradient];
  return steps.map((step, index) => {
    const next = index === steps.length - 1 ? 1 : steps[index + 1];
    return { x: step * 100, width: (next - step) * 100, index };
  });
}

// Type for chart data point (matches tRPC return type)
export interface ChartDataPoint {
  debt: string;
  debtInFront: string;
  rate: string;
  size: number;
}

// Type for debt in front data (matches tRPC return type)
export interface DebtInFrontData {
  debtInFront: Dnum;
  totalDebt: Dnum;
}
