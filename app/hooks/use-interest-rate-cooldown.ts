import { useMemo } from "react";

const INTEREST_RATE_ADJ_COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Format remaining time in a human-readable format
 */
export function formatRemainingTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    if (remainingHours > 0) {
      return `${days} day${days > 1 ? "s" : ""} ${remainingHours}h`;
    }
    return `${days} day${days > 1 ? "s" : ""}`;
  }
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    if (remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
  if (seconds > 0) {
    return `${seconds} second${seconds > 1 ? "s" : ""}`;
  }
  return "now";
}

/**
 * Hook to check if a trove is in interest rate adjustment cooldown period
 * Uses the lastInterestRateAdjTime from the Position object
 */
export function useInterestRateCooldown(lastInterestRateAdjTime: number | undefined) {
  return useMemo(() => {
    if (!lastInterestRateAdjTime) {
      return {
        isInCooldown: false,
        remainingTime: 0,
        remainingTimeFormatted: "",
        cooldownEndTime: 0,
      };
    }

    // lastInterestRateAdjTime is in seconds, convert to milliseconds
    const cooldownEndTime = lastInterestRateAdjTime * 1000 + INTEREST_RATE_ADJ_COOLDOWN;
    const now = Date.now();
    const remainingTime = Math.max(0, cooldownEndTime - now);
    const isInCooldown = remainingTime > 0;

    return {
      isInCooldown,
      remainingTime,
      remainingTimeFormatted: isInCooldown ? formatRemainingTime(remainingTime) : "",
      cooldownEndTime,
    };
  }, [lastInterestRateAdjTime]);
}