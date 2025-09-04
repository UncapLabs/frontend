// Visual constants and lightweight utilities for interest rate visualization
// This file contains ONLY visual constants and client-side rendering utilities
// All business logic and data processing is handled on the server

// Risk level types
export type RiskLevel = "low" | "medium" | "high";

// Risk color mappings - single source of truth for visual colors
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

// Radix UI thumb color classes
export const THUMB_COLOR_CLASSES = {
  0: "border-red-500 bg-red-500",
  1: "border-yellow-500 bg-yellow-500",
  2: "border-green-500 bg-green-500",
} as const;

// Chart rendering constants
export const CHART_CONSTANTS = {
  BAR_HEIGHT: 4,
  HANDLE_SIZE: 26,
  MIN_WIDTH: 26 * 2,
  CHART_MAX_HEIGHT: 30,
  HEIGHT: 60,
  GRADIENT_TRANSITION_BLUR: 4,
} as const;

// Gradient mode types
export type GradientMode = "low-to-high" | "high-to-low";

// Get gradient colors based on mode (for visual display only)
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

// Get dimmed gradient colors for backgrounds
export function getGradientColorsDimmed(mode: GradientMode = "high-to-low") {
  const colors = [
    RISK_COLORS_DIMMED.high,
    RISK_COLORS_DIMMED.medium,
    RISK_COLORS_DIMMED.low,
  ];
  return mode === "low-to-high" ? colors : colors.reverse();
}

// Map risk level to color (for visual display)
export function riskLevelToColor(risk: RiskLevel): string {
  switch (risk) {
    case "low":
      return RISK_COLORS.high; // low debt in front = high risk = red
    case "medium":
      return RISK_COLORS.medium; // medium risk = yellow
    case "high":
      return RISK_COLORS.low; // high debt in front = low risk = green
  }
}

// Get color for slider handle based on position in risk zones
export function getHandleColorFromPosition(
  position: number,
  highRiskThreshold?: number,
  mediumRiskThreshold?: number
): string {
  // If no thresholds provided, default to green
  if (highRiskThreshold === undefined || mediumRiskThreshold === undefined) {
    return RISK_COLORS.low;
  }

  // Position represents the slider position (0 to 1)
  // IMPORTANT: In interest rate context:
  // - Lower interest rates = less debt in front = HIGH risk of redemption
  // - Higher interest rates = more debt in front = LOW risk of redemption
  //
  // The thresholds represent interest rate positions where risk changes:
  // - Below highRiskThreshold: HIGH risk (red)
  // - Between highRiskThreshold and mediumRiskThreshold: MEDIUM risk (yellow)
  // - Above mediumRiskThreshold: LOW risk (green)

  if (position < highRiskThreshold) {
    return RISK_COLORS.high; // Red for high risk (low interest rate)
  } else if (position < mediumRiskThreshold) {
    return RISK_COLORS.medium; // Yellow for medium risk (medium interest rate)
  } else {
    return RISK_COLORS.low; // Green for low risk (high interest rate)
  }
}

// Get risk level from position (lightweight calculation for UI updates)
export function getRiskLevelFromPosition(
  position: number,
  riskZones: { highRiskThreshold: number; mediumRiskThreshold: number }
): RiskLevel {
  if (position <= riskZones.highRiskThreshold) return "low";
  if (position <= riskZones.mediumRiskThreshold) return "medium";
  return "high";
}

// Calculate gradient geometry for visual zones (UI rendering only)
export function calculateGradientGeometry(riskZones: {
  highRiskThreshold: number;
  mediumRiskThreshold: number;
}) {
  return [
    { x: 0, width: riskZones.highRiskThreshold * 100, index: 0 },
    {
      x: riskZones.highRiskThreshold * 100,
      width:
        (riskZones.mediumRiskThreshold - riskZones.highRiskThreshold) * 100,
      index: 1,
    },
    {
      x: riskZones.mediumRiskThreshold * 100,
      width: (1 - riskZones.mediumRiskThreshold) * 100,
      index: 2,
    },
  ];
}

// Find closest position in chart data (for slider interaction)
export function findPositionInChart(
  targetRate: number,
  chartBars: Array<{ rate: number }>
): number {
  if (chartBars.length === 0) return 0;

  // Find the closest bar to the target rate
  let closestIndex = 0;
  let minDiff = Math.abs(chartBars[0].rate - targetRate);

  for (let i = 1; i < chartBars.length; i++) {
    const diff = Math.abs(chartBars[i].rate - targetRate);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = i;
    }
  }

  return closestIndex / Math.max(1, chartBars.length - 1);
}

// Get rate from position in chart (for slider interaction)
export function getRateFromPosition(
  position: number,
  chartBars: Array<{ rate: number }>
): number {
  if (chartBars.length === 0) return 0.005; // Default 0.5%

  const index = Math.round(position * (chartBars.length - 1));
  const clampedIndex = Math.max(0, Math.min(chartBars.length - 1, index));

  return chartBars[clampedIndex].rate;
}
