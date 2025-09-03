import * as dn from "dnum";

// Types
export type Dnum = dn.Dnum;

// Interest rate constants
export const INTEREST_RATE_START = dn.from(0.005, 18); // 0.5%
export const INTEREST_RATE_END = dn.from(0.2, 18); // 20%
export const INTEREST_RATE_PRECISE_UNTIL = dn.from(0.05, 18); // 5%
export const INTEREST_RATE_INCREMENT_PRECISE = dn.from(0.001, 18); // 0.1%
export const INTEREST_RATE_INCREMENT_NORMAL = dn.from(0.005, 18); // 0.5%

// Time constants
export const ONE_YEAR_D18 = 365n * 24n * 60n * 60n * 10n ** 18n;

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

export const DNUM_0 = dn.from(0, 18);

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
