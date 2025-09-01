import * as dn from "dnum";

// Types
export type Dnum = dn.Dnum;

// Interest rate constants
export const INTEREST_RATE_START = dn.from(0.005, 18); // 0.5%
export const INTEREST_RATE_END = dn.from(0.20, 18); // 20%
export const INTEREST_RATE_PRECISE_UNTIL = dn.from(0.05, 18); // 5%
export const INTEREST_RATE_INCREMENT_PRECISE = dn.from(0.001, 18); // 0.1%
export const INTEREST_RATE_INCREMENT_NORMAL = dn.from(0.005, 18); // 0.5%

// Time constants
export const ONE_YEAR_D18 = 365n * 24n * 60n * 60n * 10n ** 18n;

// Redemption risk thresholds
export const REDEMPTION_RISK = {
  low: dn.from(0.10, 18), // < 10% of debt ahead = low risk
  medium: dn.from(0.25, 18), // 10-25% of debt ahead = medium risk
  // > 25% of debt ahead = high risk
};

// Helper functions for dnum conversions
export const dnum18 = (value: bigint | string): Dnum => {
  if (typeof value === "string") {
    // If it's already a JSON string representation
    if (value.startsWith("[") || value.startsWith("{")) {
      return dn.from(value, 18);
    }
    // Otherwise parse as bigint
    return dn.from(BigInt(value), 18);
  }
  return dn.from(value, 18);
};

export const dnum36 = (value: bigint | string): Dnum => {
  if (typeof value === "string") {
    if (value.startsWith("[") || value.startsWith("{")) {
      return dn.from(value, 36);
    }
    return dn.from(BigInt(value), 36);
  }
  return dn.from(value, 36);
};

export const DNUM_0 = dn.from(0, 18);

// Helper to find closest rate index
export function findClosestRateIndex(rates: bigint[], target: bigint): number {
  if (rates.length === 0) return 0;
  
  let closest = 0;
  let minDiff = Math.abs(Number(rates[0] - target));

  for (let i = 1; i < rates.length; i++) {
    const diff = Math.abs(Number(rates[i] - target));
    if (diff < minDiff) {
      minDiff = diff;
      closest = i;
    }
  }

  return closest;
}

// Helper for JSON stringify with Dnum support
export function jsonStringifyWithDnum(value: any): string {
  return JSON.stringify(value, (_key, val) => {
    if (dn.isDnum(val)) {
      return dn.toJSON(val);
    }
    return val;
  });
}

// Get bucket for a given interest rate (for aggregation)
export function getBucketForRate(rate: number | Dnum): Dnum {
  const rateDnum = typeof rate === "number" ? dn.from(rate, 18) : rate;

  if (dn.lt(rateDnum, INTEREST_RATE_START)) return INTEREST_RATE_START;
  if (dn.gt(rateDnum, INTEREST_RATE_END)) return INTEREST_RATE_END;

  if (dn.lt(rateDnum, INTEREST_RATE_PRECISE_UNTIL)) {
    // Round to nearest 0.1%
    const scaled = dn.mul(rateDnum, 1000);
    const rounded = dn.round(scaled);
    return dn.div(rounded, 1000);
  } else {
    // Round to nearest 0.5%
    const scaled = dn.mul(rateDnum, 200);
    const rounded = dn.round(scaled);
    return dn.div(rounded, 200);
  }
}

// Calculate pending interest
export function calculatePendingInterest(
  debt: bigint,
  rate: Dnum,
  timeDelta: bigint
): bigint {
  // pendingInterest = debt * rate * timeDelta / ONE_YEAR
  const debtDnum = dnum18(debt);
  const interest = dn.mul(debtDnum, rate);
  const timeAdjusted = dn.mul(interest, dnum18(timeDelta));
  const yearAdjusted = dn.div(timeAdjusted, dnum18(ONE_YEAR_D18));
  return yearAdjusted[0]; // Return the bigint value
}